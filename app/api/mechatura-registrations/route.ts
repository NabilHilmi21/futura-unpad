import { NextResponse } from "next/server";
import { isUniqueViolation } from "@/lib/database-errors";
import { jsonError, invalidRequest, rateLimited, serverError } from "@/lib/http";
import {
  createRegistrationToken,
  mechaturaPaymentAmount,
  type MechaturaCompetitionType,
} from "@/lib/payment";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase-admin";
import { mechaturaRegistrationSchema } from "@/lib/validation";
import { createClient } from "@/utils/supabase/server";

const maxFileSize = 5 * 1024 * 1024;
const documentBucket = "mechatura-documents";
const allowedVerificationTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const allowedRobotPhotoTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const duplicateRegistrationResponse = () =>
  NextResponse.json(
    {
      error:
        "A Mechatura registration already exists for this account, team, leader, or participant.",
    },
    { status: 409 }
  );

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
};

const getFile = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return value instanceof File && value.size > 0 ? value : null;
};

const getExtension = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) {
    return extension;
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
};

const validateFile = (
  file: File | null,
  options: {
    required: boolean;
    allowedTypes: Set<string>;
    label: string;
  }
) => {
  if (!file) {
    return options.required ? `${options.label} is required.` : null;
  }

  if (file.size > maxFileSize) {
    return `${options.label} must be 5 MB or smaller.`;
  }

  if (!options.allowedTypes.has(file.type)) {
    return options.allowedTypes.has("application/pdf")
      ? `${options.label} must be a PDF, JPG, PNG, or WEBP file.`
      : `${options.label} must be a JPG, PNG, or WEBP file.`;
  }

  return null;
};

const createTeamId = (competitionType: MechaturaCompetitionType) => {
  const prefix = competitionType === "sumo" ? "SUMO" : "TRANS";
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-2026-${randomValue.toUpperCase()}`;
};

const uploadPrivateFile = async ({
  file,
  path,
}: {
  file: File;
  path: string;
}) => {
  const adminSupabase = createAdminClient();
  const bytes = Buffer.from(await file.arrayBuffer());

  return adminSupabase.storage.from(documentBucket).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
};

export async function POST(request: Request) {
  const limit = await rateLimit(request, {
    key: "mechatura-registration",
    limit: 4,
    windowSeconds: 300,
  });

  if (!limit.success) {
    return rateLimited(limit.retryAfter);
  }

  const authSupabase = await createClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) {
    return jsonError("Please sign in before registering a Mechatura team.", 401);
  }

  const formData = await request.formData().catch(() => null);

  if (!formData) {
    return invalidRequest();
  }

  const membersJson = getString(formData, "members");
  const members = (() => {
    try {
      return JSON.parse(membersJson);
    } catch {
      return null;
    }
  })();

  const parsed = mechaturaRegistrationSchema.safeParse({
    competition_type: getString(formData, "competition_type"),
    team_name: getString(formData, "team_name"),
    institution: getString(formData, "institution"),
    coach_name: getString(formData, "coach_name"),
    robot_name: getString(formData, "robot_name"),
    robot_weight: getString(formData, "robot_weight"),
    robot_dimensions: getString(formData, "robot_dimensions"),
    technical_description: getString(formData, "technical_description"),
    rules_agreed: getString(formData, "rules_agreed") === "true",
    members,
  });

  const verificationDocument = getFile(formData, "verification_document");
  const robotPhoto = getFile(formData, "robot_photo");
  const verificationError = validateFile(verificationDocument, {
    required: true,
    allowedTypes: allowedVerificationTypes,
    label: "Verification document",
  });
  const robotPhotoError = validateFile(robotPhoto, {
    required: false,
    allowedTypes: allowedRobotPhotoTypes,
    label: "Robot photo",
  });

  if (!parsed.success || verificationError || robotPhotoError) {
    return NextResponse.json(
      {
        error: "Please check the registration data and try again.",
        field_errors: {
          form: parsed.success ? [] : parsed.error.issues.map((issue) => issue.message),
          verification_document: verificationError,
          robot_photo: robotPhotoError,
        },
      },
      { status: 400 }
    );
  }

  if (!verificationDocument) {
    return invalidRequest();
  }

  const adminSupabase = createAdminClient();
  const orderId = createRegistrationToken();
  const teamId = createTeamId(parsed.data.competition_type);
  const baseStoragePath = `${user.id}/${orderId}`;
  const uploadedPaths: string[] = [];
  const verificationPath = `${baseStoragePath}/verification.${getExtension(
    verificationDocument
  )}`;
  const robotPhotoPath = robotPhoto
    ? `${baseStoragePath}/robot-photo.${getExtension(robotPhoto)}`
    : null;

  const verificationUpload = await uploadPrivateFile({
    file: verificationDocument,
    path: verificationPath,
  });

  if (verificationUpload.error) {
    console.error("Mechatura verification upload failed", verificationUpload.error.message);
    return serverError();
  }

  uploadedPaths.push(verificationPath);

  if (robotPhoto && robotPhotoPath) {
    const robotPhotoUpload = await uploadPrivateFile({
      file: robotPhoto,
      path: robotPhotoPath,
    });

    if (robotPhotoUpload.error) {
      await adminSupabase.storage.from(documentBucket).remove(uploadedPaths);
      console.error("Mechatura robot photo upload failed", robotPhotoUpload.error.message);
      return serverError();
    }

    uploadedPaths.push(robotPhotoPath);
  }

  const { data: registrationId, error } = await adminSupabase.rpc(
    "create_mechatura_registration",
    {
      p_user_id: user.id,
      p_competition_type: parsed.data.competition_type,
      p_team_id: teamId,
      p_team_name: parsed.data.team_name,
      p_institution: parsed.data.institution,
      p_coach_name: parsed.data.coach_name,
      p_robot_name: parsed.data.robot_name,
      p_robot_weight: parsed.data.robot_weight,
      p_robot_dimensions: parsed.data.robot_dimensions,
      p_technical_description: parsed.data.technical_description,
      p_verification_document_path: verificationPath,
      p_robot_photo_path: robotPhotoPath,
      p_rules_agreed: parsed.data.rules_agreed,
      p_payment_amount: mechaturaPaymentAmount,
      p_xendit_external_id: orderId,
      p_members: parsed.data.members,
    }
  );

  if (error) {
    await adminSupabase.storage.from(documentBucket).remove(uploadedPaths);

    if (isUniqueViolation(error)) {
      return duplicateRegistrationResponse();
    }

    console.error("Mechatura registration insert failed", error.message);
    return serverError();
  }

  return NextResponse.json({
    registration_id: registrationId,
    order_id: orderId,
    team_id: teamId,
  });
}
