"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaymentActionsProps = {
  orderId: string;
};

export default function PaymentActions({ orderId }: PaymentActionsProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePay = async () => {
    setIsLoading(true);
    setErrorMessage("");

    const response = await fetch("/api/payment/midtrans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId }),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.redirect_url) {
      setErrorMessage(data?.error ?? "Unable to start payment. Please try again.");
      setIsLoading(false);
      return;
    }

    window.location.assign(data.redirect_url);
  };

  return (
    <section className="space-y-3">
      {errorMessage ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button asChild variant="outline" className="h-11 rounded-xl">
          <Link href="/registration">
            <ArrowLeft className="h-4 w-4" />
            Back to registration
          </Link>
        </Button>
        <Button
          onClick={handlePay}
          className="h-11 rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Preparing payment..." : "Continue Payment"}
        </Button>
      </div>
    </section>
  );
}
