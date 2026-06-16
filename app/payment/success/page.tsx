import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import SeminarRegistrationProgress from "@/components/seminar-registration-progress";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  getXenditPaidAt,
  isMechaturaCompetitionType,
  isRegistrationToken,
  mechaturaCompetitionLabels,
  mechaturaPaymentAmount,
  normalizeXenditInvoiceStatus,
  registrationProgramLabels,
  type RegistrationProgram,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import { getXenditInvoice } from "@/lib/xendit";
import ReceiptImage, { type ReceiptData } from "./receipt-image";

type SuccessSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type MechaturaPaymentVerificationRow = {
  id: string;
  team_name: string;
  institution: string;
  competition_type: unknown;
  robot_name: string;
  payment_amount: number | null;
  paid_at: string | null;
  payment_status: string | null;
  xendit_external_id: string;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  user_id: string;
};

type VerificationOrder = {
  program: RegistrationProgram;
  table: "mechatura_registrations";
  name: string;
  email: string;
  phone: string;
  institution: string;
  ticket: string;
  amount: number;
  paidAt: string | null;
  paymentStatus: string | null;
  externalId: string;
  invoiceId: string | null;
  invoiceUrl: string | null;
  userId: string | null;
};

const createReceipt = (order: VerificationOrder): ReceiptData => ({
  title: `${registrationProgramLabels[order.program]} Payment Receipt`,
  name: order.name,
  email: order.email,
  phone: order.phone,
  institution: order.institution,
  program: registrationProgramLabels[order.program],
  ticket: order.ticket,
  amount: formatCurrency(order.amount),
  paidAt: order.paidAt ? new Date(order.paidAt).toLocaleString("id-ID") : "-",
  invoiceId: order.invoiceId ?? "-",
  referenceId: order.externalId,
});

const findMechaturaOrder = async (
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string
): Promise<VerificationOrder | null> => {
  const { data, error } = await supabase
    .from("mechatura_registrations")
    .select(
      "id,team_name,institution,competition_type,robot_name,payment_amount,paid_at,payment_status,xendit_external_id,xendit_invoice_id,xendit_invoice_url,user_id"
    )
    .eq("xendit_external_id", orderId)
    .maybeSingle<MechaturaPaymentVerificationRow>();

  if (error) {
    throw error;
  }

  if (!data || !isMechaturaCompetitionType(data.competition_type)) {
    return null;
  }

  const { data: leader, error: leaderError } = await supabase
    .from("mechatura_members")
    .select("full_name,email,phone")
    .eq("registration_id", data.id)
    .eq("is_leader", true)
    .maybeSingle<{ full_name: string; email: string | null; phone: string | null }>();

  if (leaderError) {
    throw leaderError;
  }

  if (!leader?.email || !leader.phone) {
    return null;
  }

  return {
    program: "mechatura",
    table: "mechatura_registrations",
    name: `${data.team_name} / ${leader.full_name}`,
    email: leader.email,
    phone: leader.phone,
    institution: data.institution,
    ticket: `${mechaturaCompetitionLabels[data.competition_type]} - ${data.robot_name}`,
    amount: data.payment_amount ?? mechaturaPaymentAmount,
    paidAt: data.paid_at,
    paymentStatus: data.payment_status,
    externalId: data.xendit_external_id,
    invoiceId: data.xendit_invoice_id,
    invoiceUrl: data.xendit_invoice_url,
    userId: data.user_id,
  };
};

const findOrder = findMechaturaOrder;

async function verifyPayment(orderId: string) {
  const supabase = createAdminClient();
  const order = await findOrder(supabase, orderId);

  if (!order) {
    return { status: "invalid" as const };
  }

  if (order.userId) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (order.userId !== user?.id) {
      return { status: "invalid" as const };
    }
  }

  if (order.paymentStatus === "paid" || order.paymentStatus === "settled") {
    return { status: "paid" as const, receipt: createReceipt(order) };
  }

  if (!order.invoiceId) {
    return { status: "pending" as const };
  }

  const invoice = await getXenditInvoice(order.invoiceId);

  if (!invoice || invoice.external_id !== order.externalId) {
    return { status: "pending" as const };
  }

  const invoiceAmount = typeof invoice.amount === "number" ? invoice.amount : null;

  if (invoiceAmount !== order.amount) {
    console.error("Payment amount verification failed", {
      external_id: order.externalId,
    });
    return { status: "pending" as const };
  }

  const paymentStatus = normalizeXenditInvoiceStatus(invoice.status);
  const paidAt =
    paymentStatus === "paid" || paymentStatus === "settled"
      ? getXenditPaidAt(invoice)
      : order.paidAt;
  const updatePayload: Record<string, string | null> = {
    payment_status: paymentStatus,
    paid_at: paidAt,
    xendit_invoice_id: invoice.id,
    xendit_invoice_url: invoice.invoice_url ?? order.invoiceUrl,
  };

  if (
    order.program === "mechatura" &&
    (paymentStatus === "paid" || paymentStatus === "settled")
  ) {
    updatePayload.registration_status = "confirmed";
  }

  const { error: updateError } = await supabase
    .from(order.table)
    .update(updatePayload)
    .eq("xendit_external_id", order.externalId);

  if (updateError) {
    console.error("Payment sync failed", updateError.message);
    return { status: "pending" as const };
  }

  if (paymentStatus !== "paid" && paymentStatus !== "settled") {
    return { status: "pending" as const };
  }

  return {
    status: "paid" as const,
    receipt: createReceipt({
      ...order,
      paymentStatus,
      paidAt,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url ?? order.invoiceUrl,
    }),
  };
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: SuccessSearchParams;
}) {
  const params = await searchParams;
  const orderIdParam = Array.isArray(params.order_id)
    ? params.order_id[0]
    : params.order_id;
  const result = isRegistrationToken(orderIdParam)
    ? await verifyPayment(orderIdParam)
    : { status: "invalid" as const };

  const isPaid = result.status === "paid";
  const Icon = isPaid ? CheckCircle2 : Clock;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-6 py-16 sm:px-8">
      <SeminarRegistrationProgress currentStep={2} />

      <section className="rounded-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-7 w-7 text-foreground" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {isPaid ? "Payment Successful" : "Payment Verification Pending"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {isPaid
            ? "Thank you. Your Futura registration payment has been completed and verified."
            : "We received the payment redirect, but the payment has not been verified yet. Please wait a moment or refresh this page."}
        </p>

        <div className="mt-8 flex justify-center">
          <Button asChild className="h-11 rounded-xl px-4 py-5">
            <Link href={isPaid ? "/" : "/registration"}>
              {isPaid ? "Back to Home" : "Back to Registration"}
            </Link>
          </Button>
        </div>
      </section>

      {isPaid && result.receipt ? <ReceiptImage receipt={result.receipt} /> : null}
    </main>
  );
}
