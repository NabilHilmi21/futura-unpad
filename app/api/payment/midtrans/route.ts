import { NextResponse } from "next/server";
import { z } from "zod";

import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import {
  findMechaturaPaymentOrder,
  getMechaturaPaymentItemName,
} from "@/lib/mechatura/payment";
import {
  createMidtransSnapTransaction,
  getMidtransEnvironment,
} from "@/lib/midtrans";
import { isRegistrationToken } from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const midtransPaymentSchema = z.object({
  order_id: z.string().refine(isRegistrationToken),
});

const getOrigin = (request: Request) =>
  process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "midtrans-payment",
    limit: 10,
    windowSeconds: 60,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const body = await readJsonBody(request);

  if (!body.ok) {
    return body.response;
  }

  const parsed = midtransPaymentSchema.safeParse(body.data);

  if (!parsed.success) {
    return invalidRequest();
  }

  const adminSupabase = createAdminClient();
  const order = await findMechaturaPaymentOrder(
    adminSupabase,
    parsed.data.order_id
  ).catch((error) => {
    console.error("Midtrans order lookup failed", error.message);
    return null;
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.userId) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (order.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (order.paymentStatus === "paid" || order.paymentStatus === "settled") {
    return NextResponse.json({
      redirect_url: `/payment/success?order_id=${encodeURIComponent(
        order.paymentOrderId
      )}`,
    });
  }

  const origin = getOrigin(request);
  const successUrl = `${origin}/payment/success?order_id=${encodeURIComponent(
    order.paymentOrderId
  )}`;
  const paymentUrl = `${origin}/payment?order_id=${encodeURIComponent(
    order.paymentOrderId
  )}`;

  console.info("Creating Midtrans Snap transaction", {
    environment: getMidtransEnvironment(),
    orderId: order.paymentOrderId,
  });

  const transaction = await createMidtransSnapTransaction({
    orderId: order.paymentOrderId,
    amount: order.paymentAmount,
    itemName: getMechaturaPaymentItemName(order),
    customer: order.leader,
    finishUrl: successUrl,
    errorUrl: paymentUrl,
    pendingUrl: paymentUrl,
  }).catch((error) => {
    console.error("Midtrans transaction creation failed", error.message);
    return null;
  });

  if (!transaction?.redirect_url) {
    return serverError();
  }

  const { error: updateError } = await adminSupabase
    .from("mechatura_registrations")
    .update({ payment_status: "pending" })
    .eq("midtrans_order_id", order.paymentOrderId);

  if (updateError) {
    console.error("Payment status update failed", updateError.message);
  }

  return NextResponse.json({
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  });
}
