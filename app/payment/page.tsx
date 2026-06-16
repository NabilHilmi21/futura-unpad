import Link from "next/link";
import { CreditCard } from "lucide-react";
import SeminarRegistrationProgress from "@/components/seminar-registration-progress";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  isMechaturaCompetitionType,
  isPaymentStatus,
  isRegistrationToken,
  mechaturaCompetitionLabels,
  mechaturaPaymentAmount,
  paymentStatusLabels,
  registrationProgramLabels,
  type RegistrationProgram,
} from "@/lib/payment";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import PaymentActions from "./payment-actions";

type PaymentSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

type MechaturaRegistrationOrder = {
  id: string;
  team_name: string;
  institution: string;
  competition_type: unknown;
  robot_name: string;
  payment_status: string | null;
  payment_amount: number | null;
  xendit_external_id: string;
  user_id: string;
};

type PaymentOrder = {
  program: RegistrationProgram;
  title: string;
  subtitle: string;
  buyerName: string;
  email: string;
  phone: string;
  institution: string;
  ticketLabel: string;
  paymentStatus: string | null;
  externalId: string;
  userId: string | null;
  amount: number;
  details: Array<[string, string]>;
};

function InvalidPaymentState() {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-6 py-16 sm:px-8">
      <SeminarRegistrationProgress currentStep={2} />
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Payment link is invalid.
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Please return to registration and submit the form again.
        </p>
        <Button asChild className="mt-6 rounded-xl">
          <Link href="/registration">Back to registration</Link>
        </Button>
      </section>
    </main>
  );
}

const findMechaturaOrder = async (
  supabase: ReturnType<typeof createAdminClient>,
  orderId: string
): Promise<PaymentOrder | null> => {
  const { data: order, error } = await supabase
    .from("mechatura_registrations")
    .select(
      "id,team_name,institution,competition_type,robot_name,payment_status,payment_amount,xendit_external_id,user_id"
    )
    .eq("xendit_external_id", orderId)
    .maybeSingle<MechaturaRegistrationOrder>();

  if (error) {
    throw error;
  }

  if (!order || !isMechaturaCompetitionType(order.competition_type)) {
    return null;
  }

  const { data: leader, error: leaderError } = await supabase
    .from("mechatura_members")
    .select("full_name,email,phone")
    .eq("registration_id", order.id)
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
    title: "Mechatura Team Registration",
    subtitle: `${mechaturaCompetitionLabels[order.competition_type]} - ${order.robot_name}`,
    buyerName: leader.full_name,
    email: leader.email,
    phone: leader.phone,
    institution: order.institution,
    ticketLabel: "Mechatura Competition Fee",
    paymentStatus: order.payment_status,
    externalId: order.xendit_external_id,
    userId: order.user_id,
    amount: order.payment_amount ?? mechaturaPaymentAmount,
    details: [
      ["Team Name", order.team_name],
      ["Category", mechaturaCompetitionLabels[order.competition_type]],
      ["Robot", order.robot_name],
      ["Leader", leader.full_name],
      ["Email", leader.email],
      ["Phone Number", leader.phone],
      ["Institution", order.institution],
    ],
  };
};

const findOrder = findMechaturaOrder;

export default async function PaymentPage({
  searchParams,
}: {
  searchParams: PaymentSearchParams;
}) {
  const params = await searchParams;
  const orderId = Array.isArray(params.order_id)
    ? params.order_id[0]
    : params.order_id;

  if (!isRegistrationToken(orderId)) {
    return <InvalidPaymentState />;
  }

  const supabase = createAdminClient();
  const order = await findOrder(supabase, orderId).catch((error) => {
    console.error("Payment order lookup failed", error.message);
    return null;
  });

  if (!order) {
    return <InvalidPaymentState />;
  }

  if (order.userId) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (order.userId !== user?.id) {
      return <InvalidPaymentState />;
    }
  }

  const paymentStatus = isPaymentStatus(order.paymentStatus)
    ? order.paymentStatus
    : "unpaid";
  const isPaid = paymentStatus === "paid" || paymentStatus === "settled";

  return (
    <main className="mx-auto w-full max-w-3xl space-y-12 px-6 py-16 sm:px-8">
      <section className="space-y-2">
        <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          Complete Payment.
        </h1>
        <p className="max-w-lg text-sm leading-6 text-muted-foreground">
          Review your {registrationProgramLabels[order.program]} order before
          continuing to payment.
        </p>
      </section>

      <SeminarRegistrationProgress currentStep={2} />

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Order Summary</h2>
              <p className="text-sm text-muted-foreground">{order.title}</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border">
          <div className="p-5">
            <h3 className="text-sm font-semibold">Registration Details</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {order.details.map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 break-words text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div>
              <p className="font-medium">{order.ticketLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{order.subtitle}</p>
            </div>
            <p className="font-medium">{formatCurrency(order.amount)}</p>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.amount)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Admin fee</span>
              <span>Rp. 0</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment status</span>
              <span>{paymentStatusLabels[paymentStatus]}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/40 p-5">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-semibold tracking-tight">
              {formatCurrency(order.amount)}
            </span>
          </div>
        </div>
      </section>

      {isPaid ? (
        <Button asChild className="h-11 rounded-xl">
          <Link href={`/payment/success?order_id=${order.externalId}`}>
            View receipt
          </Link>
        </Button>
      ) : (
        <PaymentActions orderId={order.externalId} />
      )}
    </main>
  );
}
