import type { MechaturaCompetitionType } from "@/lib/payment";
import { mechaturaCompetitionLabels } from "@/lib/payment";

export type DownloadMechaturaTicketArgs = {
  registrationId: string;
  teamName: string;
  institution: string;
  competitionType: string | null;
  robotName: string;
  leaderName: string;
};

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
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
}

function getSafeTicketFileName(parts: string[]) {
  return parts.join("_").replace(/[^a-z0-9_]/gi, "_");
}

export async function downloadMechaturaTicket(args: DownloadMechaturaTicketArgs) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  ctx.fillStyle = "#111111";
  ctx.font = "700 54px Arial";
  ctx.fillText("Mechatura Competition", 90, 140);

  const category = args.competitionType
    ? mechaturaCompetitionLabels[args.competitionType as MechaturaCompetitionType] || "Mechatura"
    : "Mechatura";

  ctx.font = "400 24px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText(category, 90, 180);

  ctx.strokeStyle = "#d4d4d4";
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(820, 95);
  ctx.lineTo(820, canvas.height - 95);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#111111";
  ctx.font = "700 46px Arial";
  drawWrappedText(ctx, args.teamName || "Team", 90, 285, 680, 56);

  ctx.font = "400 24px Arial";
  ctx.fillStyle = "#666666";
  ctx.fillText(`Robot: ${args.robotName}`, 90, 350);
  ctx.fillText(`Leader: ${args.leaderName}`, 90, 388);

  const rows = [
    ["Institution", args.institution || "-"],
    ["Status", "Paid & Registered"],
    ["Registration ID", args.registrationId],
  ];

  let y = 150;
  for (const [label, value] of rows) {
    ctx.fillStyle = "#777777";
    ctx.font = "400 20px Arial";
    ctx.fillText(label, 870, y);

    ctx.fillStyle = "#111111";
    ctx.font = "700 24px Arial";
    drawWrappedText(ctx, value || "-", 870, y + 34, 245, 30);
    y += 110;
  }

  ctx.fillStyle = "#666666";
  ctx.font = "400 22px Arial";
  ctx.fillText("Show this ticket during competition check-in.", 90, 650);

  const qrCanvas = document.getElementById(`qr-canvas-${args.registrationId}`) as HTMLCanvasElement;
  if (qrCanvas) {
    ctx.drawImage(qrCanvas, 90, 410, 200, 200);
  } else {
    // Attempt fallback if multiple elements (e.g. without ID suffix)
    const fallbackCanvas = document.getElementById("mechatura-qr-canvas") as HTMLCanvasElement;
    if (fallbackCanvas) {
      ctx.drawImage(fallbackCanvas, 90, 410, 200, 200);
    }
  }

  const link = document.createElement("a");
  const fileName = getSafeTicketFileName([
    "Mechatura",
    args.teamName || "TICKET",
    args.registrationId,
  ]);
  link.download = `${fileName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
