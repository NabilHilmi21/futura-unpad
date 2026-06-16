"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

type SeminarRegistrationField = "nama" | "email" | "telp" | "institusi";
type SeminarStep = "details" | "verification" | "ticket";

const initialUser = {
  nama: "",
  email: "",
  telp: "",
  institusi: "",
  status_akademika: "mahasiswa",
};

const steps: Array<{ id: SeminarStep; label: string }> = [
  { id: "details", label: "Details" },
  { id: "verification", label: "Verify" },
  { id: "ticket", label: "Ticket" },
];

const fields: Array<{
  id: SeminarRegistrationField;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}> = [
  {
    id: "nama",
    label: "Nama Lengkap",
    placeholder: "Nama sesuai identitas",
    autoComplete: "name",
  },
  {
    id: "email",
    label: "Email",
    placeholder: "nama@email.com",
    type: "email",
    autoComplete: "email",
  },
  {
    id: "telp",
    label: "Nomor WhatsApp",
    placeholder: "+62 8XX-XXXX-XXXX",
    autoComplete: "tel",
  },
  {
    id: "institusi",
    label: "Asal Institusi",
    placeholder: "Nama sekolah, kampus, instansi, atau komunitas",
    autoComplete: "organization",
  },
];

const statusOptions = [
  {
    id: "mahasiswa",
    title: "Mahasiswa",
    description: "Peserta dari perguruan tinggi.",
  },
  {
    id: "siswa",
    title: "Siswa",
    description: "Peserta dari sekolah menengah.",
  },
  {
    id: "dosen",
    title: "Dosen",
    description: "Tenaga pendidik perguruan tinggi.",
  },
  {
    id: "umum",
    title: "Umum",
    description: "Peserta umum atau profesional.",
  },
];

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

export default function SeminarRegistrationForm() {
  const { user } = useAuth();
  const [step, setStep] = useState<SeminarStep>("details");
  const [newUser, setNewUser] = useState(initialUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [registrationId, setRegistrationId] = useState("");

  const activeStepIndex = steps.findIndex((item) => item.id === step);
  const statusLabel = useMemo(
    () =>
      statusOptions.find((option) => option.id === newUser.status_akademika)
        ?.title ?? "-",
    [newUser.status_akademika]
  );

  useEffect(() => {
    if (!user?.email) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setNewUser((currentUser) => ({
        ...currentUser,
        email: currentUser.email || user.email || "",
      }));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [user?.email]);

  const updateField = (field: SeminarRegistrationField, value: string) => {
    setNewUser((user) => ({
      ...user,
      [field]: value,
    }));
    setIdentityConfirmed(false);
  };

  const goToVerification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setStep("verification");
  };

  const submitRegistration = async () => {
    if (!identityConfirmed) {
      setErrorMessage(
        "Please confirm your identity details before generating the ticket."
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const res = await fetch("/api/seminar-registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama_lengkap: newUser.nama,
        email: newUser.email,
        no_telepon: newUser.telp,
        asal_institusi: newUser.institusi,
        status_akademika: newUser.status_akademika,
        identity_confirmed: identityConfirmed,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.registration_id) {
      setErrorMessage(data?.error ?? "Registration failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setRegistrationId(data.registration_id);
    setStep("ticket");
    setIsSubmitting(false);
  };

  const downloadTicket = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 720;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    ctx.fillStyle = "#111111";
    ctx.font = "700 54px Arial";
    ctx.fillText("Futura Seminar", 90, 140);

    ctx.font = "400 24px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText("Free Participant Ticket", 90, 180);

    ctx.fillStyle = "#111111";
    ctx.font = "700 46px Arial";
    drawWrappedText(ctx, newUser.nama, 90, 285, 680, 56);

    ctx.font = "400 24px Arial";
    ctx.fillStyle = "#666666";
    ctx.fillText(newUser.email, 90, 350);
    ctx.fillText(newUser.telp, 90, 388);

    ctx.strokeStyle = "#d4d4d4";
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(820, 95);
    ctx.lineTo(820, canvas.height - 95);
    ctx.stroke();
    ctx.setLineDash([]);

    const rows = [
      ["Institution", newUser.institusi],
      ["Status", statusLabel],
      ["Fee", "Free"],
      ["Registration ID", registrationId],
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
    ctx.fillText("Show this ticket during seminar check-in.", 90, 620);

    const link = document.createElement("a");
    link.download = `futura-seminar-ticket-${registrationId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <section className="space-y-8">
      <nav aria-label="Seminar registration progress" className="space-y-3">
        <ol className="flex items-center justify-between gap-3 text-xs sm:text-sm">
          {steps.map((item, index) => {
            const isActive = index <= activeStepIndex;

            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-2",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
                aria-current={index === activeStepIndex ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background"
                  )}
                >
                  {index + 1}
                </span>
                <span className="font-medium">{item.label}</span>
              </li>
            );
          })}
        </ol>

        <div
          className="h-2 rounded-full bg-muted"
          role="progressbar"
          aria-label="Seminar registration completion"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={activeStepIndex + 1}
        >
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{
              width: `${((activeStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </nav>

      {step === "details" ? (
        <form onSubmit={goToVerification}>
          <FieldGroup className="gap-6">
            <div className="rounded-[8px] border border-border bg-muted/30 p-4">
              <p className="text-sm font-medium">Free seminar registration</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Fill in your contact details exactly as you want them reviewed
                for seminar communication and certificate preparation.
              </p>
            </div>

            {fields.map((field) => (
              <Field key={field.id} className="gap-2">
                <FieldLabel htmlFor={field.id}>
                  {field.label} <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id={field.id}
                  type={field.type ?? "text"}
                  className="h-11 rounded-[8px]"
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete ?? "off"}
                  value={newUser[field.id]}
                  onChange={(e) => updateField(field.id, e.target.value)}
                  required
                />
              </Field>
            ))}

            <Field className="gap-3">
              <FieldLabel>
                Status Akademika <span aria-hidden="true">*</span>
              </FieldLabel>
              <RadioGroup
                value={newUser.status_akademika}
                onValueChange={(value) => {
                  setNewUser((user) => ({
                    ...user,
                    status_akademika: value,
                  }));
                  setIdentityConfirmed(false);
                }}
              >
                {statusOptions.map((option) => (
                  <FieldLabel
                    key={option.id}
                    htmlFor={`status-${option.id}`}
                    className="has-[>[data-slot=field]]:rounded-[8px]"
                  >
                    <Field orientation="horizontal" className="py-4">
                      <FieldContent>
                        <FieldTitle>{option.title}</FieldTitle>
                        <FieldDescription>{option.description}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        id={`status-${option.id}`}
                        value={option.id}
                      />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </Field>

            <Field>
              <Button type="submit" className="h-11 rounded-[8px]">
                Continue to identity check
              </Button>
            </Field>
          </FieldGroup>
        </form>
      ) : null}

      {step === "verification" ? (
        <FieldGroup className="gap-6">
          <div className="rounded-[8px] border border-border bg-card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Verify certificate identity</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Your name and institution will be used for seminar records and
                  certificate preparation. Check spelling and capitalization
                  carefully.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-[8px]"
                onClick={() => setStep("details")}
              >
                <PencilLine className="h-4 w-4" />
                Edit
              </Button>
            </div>

            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Nama Lengkap</dt>
                <dd className="mt-1 font-medium">{newUser.nama}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 break-all font-medium">{newUser.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Nomor WhatsApp</dt>
                <dd className="mt-1 font-medium">{newUser.telp}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Asal Institusi</dt>
                <dd className="mt-1 font-medium">{newUser.institusi}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status Akademika</dt>
                <dd className="mt-1 font-medium">{statusLabel}</dd>
              </div>
            </dl>
          </div>

          <Field orientation="horizontal" className="items-start rounded-[8px] border p-4">
            <Checkbox
              id="identity-confirmed"
              checked={identityConfirmed}
              onCheckedChange={(checked) => setIdentityConfirmed(checked === true)}
            />
            <FieldContent>
              <FieldLabel htmlFor="identity-confirmed">
                I confirm these details are correct for certificate records.
              </FieldLabel>
              <FieldDescription>
                If the name or institution is misspelled here, the certificate
                may use the same spelling.
              </FieldDescription>
            </FieldContent>
          </Field>

          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-[8px]"
              onClick={() => setStep("details")}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              className="h-11 rounded-[8px]"
              onClick={submitRegistration}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Confirm and get ticket"}
            </Button>
          </div>
        </FieldGroup>
      ) : null}

      {step === "ticket" ? (
        <FieldGroup className="gap-6">
          <section className="rounded-[8px] border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted">
                <CheckCircle2 className="h-5 w-5 text-foreground" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Your seminar ticket is ready</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your Futura seminar registration is saved. Download this free
                  ticket or keep the registration ID for check-in.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[8px] border border-dashed border-border p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Futura Seminar
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    {newUser.nama}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {newUser.institusi} / {statusLabel}
                  </p>
                </div>
                <div className="rounded-[8px] bg-muted p-3 text-sm">
                  <p className="text-muted-foreground">Ticket</p>
                  <p className="mt-1 font-mono text-xs font-medium">
                    {registrationId}
                  </p>
                </div>
              </div>
              <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="mt-1 break-all font-medium">{newUser.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">WhatsApp</dt>
                  <dd className="mt-1 font-medium">{newUser.telp}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fee</dt>
                  <dd className="mt-1 font-medium">Free</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="mt-1 font-medium">Registered</dd>
                </div>
              </dl>
            </div>
          </section>

          <Button
            type="button"
            className="h-11 rounded-[8px]"
            onClick={downloadTicket}
          >
            <Download className="h-4 w-4" />
            Download ticket
          </Button>
        </FieldGroup>
      ) : null}
    </section>
  );
}
