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
  mechaturaDetails?: {
    teamName: string;
    robotName: string;
    competitionType: string;
    coach?: { name: string; email: string; phone: string };
    members: Array<{ name: string; email: string; phone: string }>;
  };
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
  maxWidth: number,
  lineHeight: number = 34
) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const nextLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(nextLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = nextLine;
    }
  }

  ctx.fillText(line, x, currentY);
  return currentY;
}

function downloadInvoice(receipt: ReceiptData) {
  const canvas = document.createElement("canvas");
  const width = 2480;
  const height = 3508;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // Brand Colors
  const brandPrimary = "#2563eb"; // Blue 600
  const textMain = "#111827"; // Gray 900
  const textMuted = "#6b7280"; // Gray 500
  const borderLight = "#e5e7eb"; // Gray 200

  // 1. Top Accent & Header Background
  ctx.fillStyle = "#f8fafc"; // Slate 50
  ctx.fillRect(0, 0, width, 550);
  ctx.fillStyle = brandPrimary;
  ctx.fillRect(0, 0, width, 24);

  // Logo / Company Name
  ctx.fillStyle = brandPrimary;
  ctx.font = "900 110px Inter, Arial, sans-serif";
  ctx.fillText("FUTURA.", 160, 200);

  ctx.fillStyle = textMuted;
  ctx.font = "500 36px Inter, Arial, sans-serif";
  ctx.fillText("Universitas Padjadjaran", 165, 260);

  // Billed By
  ctx.font = "400 32px Inter, Arial, sans-serif";
  ctx.fillText("Jl. Raya Bandung Sumedang KM. 21", 165, 340);
  ctx.fillText("Jatinangor, Sumedang 45363", 165, 390);
  ctx.fillText("Jawa Barat, Indonesia", 165, 440);
  ctx.fillText("futura@unpad.ac.id", 165, 490);

  // Right Side Header (INVOICE text)
  ctx.fillStyle = brandPrimary;
  ctx.font = "800 130px Inter, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("INVOICE", width - 160, 200);

  // Invoice Meta
  ctx.fillStyle = textMain;
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText(`INV-${receipt.invoiceId?.slice(0, 8).toUpperCase() || "0000"}`, width - 160, 260);
  
  ctx.font = "400 32px Inter, Arial, sans-serif";
  ctx.fillStyle = textMuted;
  ctx.fillText("Reference:", width - 420, 340);
  ctx.fillText("Date Paid:", width - 420, 390);
  ctx.fillText("Status:", width - 420, 440);

  ctx.fillStyle = textMain;
  ctx.font = "600 32px Inter, Arial, sans-serif";
  ctx.fillText(receipt.referenceId || "-", width - 160, 340);
  ctx.fillText(receipt.paidAt || "-", width - 160, 390);
  
  ctx.fillStyle = "#059669"; // Green 600
  ctx.fillText("COMPLETED", width - 160, 440);
  ctx.textAlign = "left";

  // 2. Bill To Section
  let currentY = 720;
  ctx.fillStyle = textMuted;
  ctx.font = "700 32px Inter, Arial, sans-serif";
  ctx.fillText("BILLED TO", 160, currentY);

  currentY += 70;
  ctx.fillStyle = textMain;
  ctx.font = "700 48px Inter, Arial, sans-serif";
  ctx.fillText(receipt.name || "-", 160, currentY);
  
  currentY += 60;
  ctx.fillStyle = textMuted;
  ctx.font = "400 36px Inter, Arial, sans-serif";
  ctx.fillText(receipt.institution || "-", 160, currentY);
  currentY += 50;
  ctx.fillText(receipt.email || "-", 160, currentY);
  currentY += 50;
  ctx.fillText(receipt.phone || "-", 160, currentY);

  // Watermark / Stamp "PAID"
  ctx.save();
  ctx.translate(width - 450, 800);
  ctx.rotate(-15 * Math.PI / 180);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(-200, -80, 400, 160, 20);
  } else {
    ctx.rect(-200, -80, 400, 160);
  }
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(5, 150, 105, 0.2)"; // Emerald translucent
  ctx.stroke();
  ctx.fillStyle = "rgba(5, 150, 105, 0.2)";
  ctx.font = "900 100px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("PAID", 0, 0);
  ctx.restore();

  currentY += 120;

  // 3. Team Details (If present)
  if (receipt.mechaturaDetails) {
    const boxY = currentY;
    const boxHeight = 440;
    ctx.fillStyle = "#f8fafc";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(160, boxY, width - 320, boxHeight, 24);
      ctx.fill();
      ctx.strokeStyle = borderLight;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillRect(160, boxY, width - 320, boxHeight);
      ctx.strokeRect(160, boxY, width - 320, boxHeight);
    }

    // Left Col: Team Data
    ctx.fillStyle = brandPrimary;
    ctx.font = "700 32px Inter, Arial, sans-serif";
    ctx.fillText("TEAM IDENTIFICATION", 220, boxY + 80);

    ctx.fillStyle = textMuted;
    ctx.font = "500 32px Inter, Arial, sans-serif";
    ctx.fillText("Team Name", 220, boxY + 150);
    ctx.fillText("Robot Name", 220, boxY + 220);
    ctx.fillText("Category", 220, boxY + 290);
    if (receipt.mechaturaDetails.coach) {
      ctx.fillText("Coach", 220, boxY + 360);
    }

    ctx.fillStyle = textMain;
    ctx.font = "600 32px Inter, Arial, sans-serif";
    ctx.fillText(receipt.mechaturaDetails.teamName || "-", 480, boxY + 150);
    ctx.fillText(receipt.mechaturaDetails.robotName || "-", 480, boxY + 220);
    ctx.fillText(receipt.mechaturaDetails.competitionType || "-", 480, boxY + 290);
    if (receipt.mechaturaDetails.coach) {
      ctx.fillText(receipt.mechaturaDetails.coach.name || "-", 480, boxY + 360);
    }

    // Right Col: Members Data
    ctx.fillStyle = brandPrimary;
    ctx.font = "700 32px Inter, Arial, sans-serif";
    ctx.fillText("TEAM MEMBERS", 1300, boxY + 80);

    let memY = boxY + 150;
    receipt.mechaturaDetails.members.forEach((member, i) => {
      ctx.fillStyle = textMain;
      ctx.font = "600 32px Inter, Arial, sans-serif";
      ctx.fillText(`${i + 1}. ${member.name}`, 1300, memY);
      
      ctx.fillStyle = textMuted;
      ctx.font = "400 28px Inter, Arial, sans-serif";
      ctx.fillText(member.email, 1340, memY + 40);
      memY += 100;
    });

    currentY += boxHeight + 120;
  }

  // 4. Items Table
  // Table Header
  ctx.fillStyle = "#f1f5f9"; // Slate 100
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(160, currentY, width - 320, 80, 12);
    ctx.fill();
  } else {
    ctx.fillRect(160, currentY, width - 320, 80);
  }

  ctx.fillStyle = textMuted;
  ctx.font = "700 28px Inter, Arial, sans-serif";
  ctx.fillText("DESCRIPTION", 200, currentY + 50);
  ctx.fillText("PROGRAM", 1200, currentY + 50);
  ctx.textAlign = "center";
  ctx.fillText("QTY", 1650, currentY + 50);
  ctx.textAlign = "right";
  ctx.fillText("AMOUNT", width - 200, currentY + 50);
  ctx.textAlign = "left";

  currentY += 160;

  // Table Row
  ctx.fillStyle = textMain;
  ctx.font = "600 40px Inter, Arial, sans-serif";
  
  // Use drawText for multiline description support
  const descNextY = drawText(ctx, receipt.title || "Event Registration", 200, currentY, 900, 50);
  
  ctx.font = "400 36px Inter, Arial, sans-serif";
  ctx.fillText(receipt.program || "-", 1200, currentY);
  
  ctx.textAlign = "center";
  ctx.fillText("1", 1650, currentY);

  ctx.textAlign = "right";
  ctx.font = "600 40px Inter, Arial, sans-serif";
  ctx.fillText(receipt.amount || "-", width - 200, currentY);
  ctx.textAlign = "left";

  currentY = Math.max(descNextY + 80, currentY + 80);

  // Bottom Border of table
  ctx.strokeStyle = borderLight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(160, currentY);
  ctx.lineTo(width - 160, currentY);
  ctx.stroke();

  // 5. Totals Section
  currentY += 80;
  ctx.fillStyle = textMuted;
  ctx.font = "500 36px Inter, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("Subtotal", width - 550, currentY);
  ctx.fillText("Tax (0%)", width - 550, currentY + 60);

  ctx.fillStyle = textMain;
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText(receipt.amount || "-", width - 200, currentY);
  ctx.fillText("Rp 0", width - 200, currentY + 60);

  currentY += 140;
  ctx.fillStyle = brandPrimary;
  ctx.font = "800 44px Inter, Arial, sans-serif";
  ctx.fillText("TOTAL PAID", width - 550, currentY);
  
  ctx.font = "800 64px Inter, Arial, sans-serif";
  ctx.fillText(receipt.amount || "-", width - 200, currentY + 10);
  ctx.textAlign = "left";

  // 6. Footer Notes
  const footerY = height - 200;
  
  ctx.fillStyle = brandPrimary;
  ctx.fillRect(0, height - 40, width, 40);

  ctx.fillStyle = textMuted;
  ctx.font = "600 36px Inter, Arial, sans-serif";
  ctx.fillText("Notes & Terms:", 160, footerY - 140);
  
  ctx.font = "400 32px Inter, Arial, sans-serif";
  ctx.fillText("1. This is a computer-generated invoice and does not require a physical signature.", 160, footerY - 80);
  ctx.fillText("2. Please present this invoice and your ticket QR code during the event check-in.", 160, footerY - 30);
  
  ctx.fillStyle = textMain;
  ctx.font = "700 40px Inter, Arial, sans-serif";
  ctx.fillText("Thank you for your business!", 160, footerY + 80);

  // Trigger Download
  const link = document.createElement("a");
  link.download = `Futura_Invoice_${receipt.invoiceId || receipt.referenceId || "download"}.png`;
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
  children = "Save Invoice as Image",
  className,
  variant = "outline",
}: ReceiptDownloadButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={() => downloadInvoice(receipt)}
    >
      <Download className="h-4 w-4 mr-2" />
      {children}
    </Button>
  );
}

export function ReceiptImage({ receipt, mechaturaOrder }: { receipt: ReceiptData; mechaturaOrder?: MechaturaPaymentOrder }) {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-start gap-4 p-5 sm:p-6 border-b">
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

        <div className="space-y-5 p-5 sm:p-6">
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

