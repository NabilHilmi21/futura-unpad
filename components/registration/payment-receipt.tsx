"use client";

import type { ReactNode } from "react";
import { Download, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MechaturaTicketDownloadButton } from "@/components/registration/mechatura-ticket-download-button";
import type { MechaturaPaymentOrder } from "@/lib/mechatura/payment";

export type ReceiptData = {
  title: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  program: string;
  ticket: string;
  amount: string;
  paidAt: string;
  invoiceId: string;
  referenceId: string;
};

const receiptRows = (receipt: ReceiptData) => [
  ["Name", receipt.name],
  ["Email", receipt.email],
  ["Phone", receipt.phone],
  ["Institution", receipt.institution],
  ["Program", receipt.program],
  ["Ticket", receipt.ticket],
  ["Payment Date", receipt.paidAt],
  ["Invoice ID", receipt.invoiceId],
  ["Reference ID", receipt.referenceId],
];

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += 34;
    } else {
      line = nextLine;
    }
  }

  ctx.fillText(line, x, currentY);
  return currentY;
}

function downloadReceipt(receipt: ReceiptData) {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;
  ctx.strokeRect(56, 56, width - 112, height - 112);

  ctx.fillStyle = "#111111";
  ctx.font = "700 64px Arial";
  ctx.fillText("Futura", 96, 150);

  ctx.font = "400 30px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText(receipt.title, 96, 200);

  ctx.fillStyle = "#111111";
  ctx.font = "700 88px Arial";
  ctx.fillText(receipt.amount, 96, 330);

  ctx.font = "400 28px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText("Payment confirmed", 96, 375);

  ctx.setLineDash([16, 14]);
  ctx.strokeStyle = "#d4d4d4";
  ctx.beginPath();
  ctx.moveTo(96, 445);
  ctx.lineTo(width - 96, 445);
  ctx.stroke();
  ctx.setLineDash([]);

  let y = 530;
  for (const [label, value] of receiptRows(receipt)) {
    ctx.fillStyle = "#777777";
    ctx.font = "400 28px Arial";
    ctx.fillText(label, 96, y);

    ctx.fillStyle = "#111111";
    ctx.font = "600 32px Arial";
    const finalY = drawText(ctx, value || "-", 380, y, width - 476);
    y = finalY + 72;
  }

  ctx.setLineDash([16, 14]);
  ctx.strokeStyle = "#d4d4d4";
  ctx.beginPath();
  ctx.moveTo(96, height - 175);
  ctx.lineTo(width - 96, height - 175);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#666666";
  ctx.font = "400 26px Arial";
  ctx.fillText("Show this receipt to the committee for verification.", 96, height - 115);

  const link = document.createElement("a");
  link.download = `futura-receipt-${receipt.referenceId}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

type ReceiptDownloadButtonProps = {
  receipt: ReceiptData;
  children?: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

export function ReceiptDownloadButton({
  receipt,
  children = "Save Receipt as Image",
  className,
  variant = "outline",
}: ReceiptDownloadButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => downloadReceipt(receipt)}
    >
      <Download className="h-4 w-4" />
      {children}
    </Button>
  );
}

export function ReceiptImage({ receipt, mechaturaOrder }: { receipt: ReceiptData; mechaturaOrder?: MechaturaPaymentOrder }) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 p-8 border-b">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-5 w-5 text-foreground" />
          </span>
          <div>
            <h2 className="text-lg font-semibold">
              Your Mechatura ticket is ready
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-500">
              Your Mechatura registration is saved. Download your ticket or keep
              the registration ID for check-in.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-8">
          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">
              {receipt.amount}
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {receiptRows(receipt).map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 break-words font-medium">{value || "-"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {mechaturaOrder && receipt.program.toLowerCase().includes("mechatura") && (
          <MechaturaTicketDownloadButton
            registrationId={mechaturaOrder.id}
            teamName={mechaturaOrder.teamName || ""}
            institution={mechaturaOrder.institution || ""}
            competitionType={mechaturaOrder.competitionType || null}
            robotName={mechaturaOrder.robotName || ""}
            leaderName={mechaturaOrder.leader?.name || ""}
            className="h-11 w-full rounded-xl"
          />
        )}
        <ReceiptDownloadButton receipt={receipt} className="h-11 w-full rounded-xl" />
      </div>
    </section>
  );
}
