import { NextResponse } from "next/server";
import { z } from "zod";

import { invalidRequest, rateLimited, readJsonBody, serverError } from "@/lib/http";
import {
  ensureMidtransCompatibleMechaturaOrder,
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
  const existingOrder = await findMechaturaPaymentOrder(
    adminSupabase,
    parsed.data.order_id
  ).catch((error) => {
    console.error("Midtrans order lookup failed", error.message);
    return null;
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (existingOrder.userId) {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (existingOrder.userId !== user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (
    existingOrder.paymentStatus === "paid" ||
    existingOrder.paymentStatus === "settled"
  ) {
    return NextResponse.json({
      redirect_url: `/payment/success?order_id=${encodeURIComponent(
        existingOrder.paymentOrderId
      )}`,
    });
  }

  const order = await ensureMidtransCompatibleMechaturaOrder(
    adminSupabase,
    existingOrder
  ).catch((error) => {
    console.error("Midtrans order id rotation failed", error.message);
    return null;
  });

  if (!order) {
    return serverError();
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
