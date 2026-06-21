"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import JSZip from "jszip"
import { statusLabels } from "@/lib/payment"
import { useState } from "react"

export type DownloadRegistrationData = {
    id: string
    nama_lengkap: string
    asal_institusi: string
    email?: string | null
    no_telepon?: string | null
    status_akademika: string | null
    registration_type: string | null
    group_name?: string | null
    is_main_contact?: boolean
}

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

export function TicketDownloadButton({
    mainContact,
    members = []
}: {
    mainContact: DownloadRegistrationData
    members?: DownloadRegistrationData[]
}) {
    const [isDownloading, setIsDownloading] = useState(false)
    const allRegistrations = [mainContact, ...members]
    const isGroup = mainContact.registration_type === "group"

    const statusLabel = mainContact.status_akademika 
        ? (statusLabels[mainContact.status_akademika as keyof typeof statusLabels] || "-")
        : "-"

    const downloadTicket = async () => {
        setIsDownloading(true)
        try {
            if (isGroup && allRegistrations.length > 1) {
                const zip = new JSZip();

                for (const reg of allRegistrations) {
                    const canvas = document.createElement("canvas");
                    canvas.width = 1200;
                    canvas.height = 720;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) continue;

                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.strokeStyle = "#111111";
                    ctx.lineWidth = 4;
                    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

                    ctx.fillStyle = "#111111";
                    ctx.font = "700 54px Arial";
                    ctx.fillText(`Futura Seminar (${mainContact.group_name || "Group"})`, 90, 140);

                    ctx.font = "400 24px Arial";
                    ctx.fillStyle = "#666666";
                    ctx.fillText("Futura Seminar", 90, 180);

                    ctx.fillStyle = "#111111";
                    ctx.font = "700 46px Arial";
                    drawWrappedText(ctx, reg.nama_lengkap || "-", 90, 285, 680, 56);

                    // We use main contact info
                    ctx.font = "400 24px Arial";
                    ctx.fillStyle = "#666666";
                    ctx.fillText(mainContact.email || "-", 90, 350);
                    ctx.fillText(mainContact.no_telepon || "-", 90, 388);

                    ctx.strokeStyle = "#d4d4d4";
                    ctx.setLineDash([12, 12]);
                    ctx.beginPath();
                    ctx.moveTo(820, 95);
                    ctx.lineTo(820, canvas.height - 95);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    const rows = [
                        ["Institution", reg.asal_institusi || mainContact.asal_institusi || "-"],
                        ["Status", statusLabel],
                        ["Registration ID", reg.id],
                        ["Total Participants", `${allRegistrations.length} People`]
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
                    ctx.fillText("Show this ticket during seminar check-in.", 90, 650);

                    // Fetch the hidden QR canvas
                    const qrCanvas = document.getElementById(`qr-canvas-${reg.id}`) as HTMLCanvasElement;
                    if (qrCanvas) {
                        ctx.drawImage(qrCanvas, 90, 410, 200, 200);
                    }

                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
                    if (blob) {
                        const safeName = (reg.nama_lengkap || "TICKET").replace(/[^a-z0-9]/gi, '_').toUpperCase();
                        zip.file(`${safeName}_${reg.id}.png`, blob);
                    }
                }

                const zipBlob = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.download = `Futura_Group_Tickets.zip`;
                link.href = URL.createObjectURL(zipBlob);
                link.click();
            } else {
                // Individual download
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
                ctx.fillText(`Futura Seminar`, 90, 140);

                ctx.font = "400 24px Arial";
                ctx.fillStyle = "#666666";
                ctx.fillText("Futura Seminar", 90, 180);

                ctx.fillStyle = "#111111";
                ctx.font = "700 46px Arial";
                drawWrappedText(ctx, mainContact.nama_lengkap || "-", 90, 285, 680, 56);

                ctx.font = "400 24px Arial";
                ctx.fillStyle = "#666666";
                ctx.fillText(mainContact.email || "-", 90, 350);
                ctx.fillText(mainContact.no_telepon || "-", 90, 388);

                ctx.strokeStyle = "#d4d4d4";
                ctx.setLineDash([12, 12]);
                ctx.beginPath();
                ctx.moveTo(820, 95);
                ctx.lineTo(820, canvas.height - 95);
                ctx.stroke();
                ctx.setLineDash([]);

                const rows = [
                    ["Institution", mainContact.asal_institusi || "-"],
                    ["Status", statusLabel],
                    ["Registration ID", mainContact.id],
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
                ctx.fillText("Show this ticket during seminar check-in.", 90, 650);

                const qrCanvas = document.getElementById(`qr-canvas-${mainContact.id}`) as HTMLCanvasElement;
                if (qrCanvas) {
                    ctx.drawImage(qrCanvas, 90, 410, 200, 200);
                }

                const link = document.createElement("a");
                const safeName = (mainContact.nama_lengkap || "TICKET").replace(/[^a-z0-9]/gi, '_').toUpperCase();
                link.download = `${safeName}_${mainContact.id}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
            }
        } catch (e) {
            console.error("Ticket generation failed", e)
        } finally {
            setIsDownloading(false)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                className="w-full shrink-0 bg-black text-white hover:bg-zinc-800"
                onClick={downloadTicket}
                disabled={isDownloading}
            >
                <Download className="h-4 w-4 mr-2" />
                {isGroup ? "Download group tickets (ZIP)" : "Download ticket"}
            </Button>
            
            {/* Hidden canvases for generating QR codes */}
            <div style={{ display: 'none' }}>
               {allRegistrations.map(reg => (
                 <QRCodeCanvas key={reg.id} id={`qr-canvas-${reg.id}`} value={reg.id} size={200} />
               ))}
            </div>
        </div>
    )
}
