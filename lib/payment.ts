export type AcademicStatus = "mahasiswa" | "siswa" | "dosen" | "umum";
export type AttendanceMethod = "daring" | "luring";
export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "cancelled"
  | "settled";
export type RegistrationProgram = "seminar" | "mechatura";
export type MechaturaCompetitionType = "sumo" | "transporter";

export const paymentPrices: Record<
  AcademicStatus,
  Record<AttendanceMethod, number>
> = {
  mahasiswa: {
    daring: 0,
    luring: 0,
  },
  siswa: {
    daring: 0,
    luring: 0,
  },
  dosen: {
    daring: 0,
    luring: 0,
  },
  umum: {
    daring: 0,
    luring: 0,
  },
};

export const statusLabels: Record<AcademicStatus, string> = {
  mahasiswa: "Mahasiswa",
  siswa: "Siswa",
  dosen: "Dosen",
  umum: "Umum",
};

export const attendanceLabels: Record<AttendanceMethod, string> = {
  daring: "Daring",
  luring: "Luring",
};

export const registrationProgramLabels: Record<RegistrationProgram, string> = {
  seminar: "Futura Seminar",
  mechatura: "Mechatura",
};

export const mechaturaCompetitionLabels: Record<MechaturaCompetitionType, string> = {
  sumo: "Robot Sumo",
  transporter: "Robot Transporter",
};

export const mechaturaPaymentAmount = 250000;

export const formatCurrency = (value: number) =>
  `Rp. ${value.toLocaleString("id-ID")}`;

export const isAcademicStatus = (value: unknown): value is AcademicStatus =>
  value === "mahasiswa" ||
  value === "siswa" ||
  value === "dosen" ||
  value === "umum";

export const isAttendanceMethod = (
  value: unknown
): value is AttendanceMethod => value === "daring" || value === "luring";

export const isRegistrationProgram = (
  value: unknown
): value is RegistrationProgram => value === "seminar" || value === "mechatura";

export const isMechaturaCompetitionType = (
  value: unknown
): value is MechaturaCompetitionType =>
  value === "sumo" || value === "transporter";

export const getPaymentAmount = (
  status: AcademicStatus,
  attendance: AttendanceMethod
) => paymentPrices[status][attendance];

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  expired: "Expired",
  cancelled: "Cancelled",
  settled: "Settled",
};

export const normalizeXenditInvoiceStatus = (
  status: unknown
): PaymentStatus => {
  if (typeof status !== "string") {
    return "pending";
  }

  switch (status.toUpperCase()) {
    case "PENDING":
      return "pending";
    case "PAID":
      return "paid";
    case "SETTLED":
      return "settled";
    case "EXPIRED":
      return "expired";
    case "FAILED":
      return "failed";
    case "CANCELLED":
    case "CANCELED":
    case "VOIDED":
      return "cancelled";
    default:
      return "pending";
  }
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus =>
  typeof value === "string" && value in paymentStatusLabels;

export const getXenditPaidAt = (invoice: { paid_at?: unknown }) =>
  typeof invoice.paid_at === "string" ? invoice.paid_at : new Date().toISOString();

export const createRegistrationToken = () => {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `FUTURA-${Date.now()}-${randomValue}`;
};

export const isRegistrationToken = (value: unknown): value is string =>
  typeof value === "string" &&
  /^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/.test(value);
