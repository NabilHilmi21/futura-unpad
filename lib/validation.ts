import { z } from "zod";
import { normalizeEmail } from "@/lib/email";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

export const emailSchema = z
  .string()
  .trim()
  .email()
  .max(254)
  .transform((email) => normalizeEmail(email));

export const passwordSchema = z.string().min(8).max(128);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const seminarRegistrationSchema = z.object({
  nama_lengkap: requiredText(120),
  email: emailSchema,
  no_telepon: requiredText(32),
  asal_institusi: requiredText(160),
  status_akademika: z.enum(["mahasiswa", "siswa", "dosen", "umum"]),
  identity_confirmed: z.literal(true),
});

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || null);

const phoneSchema = z
  .string()
  .trim()
  .min(9)
  .max(32)
  .regex(/^[0-9+\-\s().]+$/);

export const mechaturaMemberSchema = z.object({
  full_name: requiredText(120),
  participant_id: requiredText(80),
  email: z
    .string()
    .trim()
    .max(254)
    .optional()
    .transform((value) => (value ? normalizeEmail(value) : null)),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((value) => value || null),
  is_leader: z.boolean(),
});

export const mechaturaRegistrationSchema = z
  .object({
    competition_type: z.enum(["sumo", "transporter"]),
    team_name: requiredText(100),
    institution: requiredText(160),
    coach_name: requiredText(120),
    robot_name: requiredText(100),
    robot_weight: optionalText(80),
    robot_dimensions: optionalText(80),
    technical_description: z.string().trim().min(40).max(2000),
    rules_agreed: z.literal(true),
    members: z.array(mechaturaMemberSchema).min(1).max(3),
  })
  .superRefine((data, ctx) => {
    const leaders = data.members.filter((member) => member.is_leader);

    if (leaders.length !== 1) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one team leader is required",
        path: ["members"],
      });
    }

    const leader = leaders[0];

    if (leader && !leader.email) {
      ctx.addIssue({
        code: "custom",
        message: "Leader email is required",
        path: ["members"],
      });
    }

    if (leader && (!leader.phone || !phoneSchema.safeParse(leader.phone).success)) {
      ctx.addIssue({
        code: "custom",
        message: "Leader phone number is required",
        path: ["members"],
      });
    }

    const participantIds = data.members.map((member) =>
      member.participant_id.toLowerCase()
    );

    if (new Set(participantIds).size !== participantIds.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate participant IDs are not allowed",
        path: ["members"],
      });
    }

    const emails = data.members
      .map((member) => member.email)
      .filter((email): email is string => Boolean(email));

    if (new Set(emails).size !== emails.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate emails are not allowed within a team",
        path: ["members"],
      });
    }

    for (const [index, member] of data.members.entries()) {
      if (member.email && !emailSchema.safeParse(member.email).success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid member email",
          path: ["members", index, "email"],
        });
      }

      if (member.phone && !phoneSchema.safeParse(member.phone).success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid member phone number",
          path: ["members", index, "phone"],
        });
      }
    }
  });

export const orderSchema = z.object({
  order_id: z.string().regex(/^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/),
});

export const idParamSchema = z.object({
  id: z.string().min(1).max(128).regex(/^[a-zA-Z0-9-]+$/),
});

export const xenditWebhookSchema = z.object({
  id: z.string().min(1).max(160),
  external_id: z.string().regex(/^FUTURA-\d{10,}-[a-zA-Z0-9-]+$/),
  status: z.string().min(1).max(40),
  amount: z.number().positive().optional(),
  invoice_url: z.string().url().max(2048).nullable().optional(),
  paid_at: z.string().max(80).nullable().optional(),
});
