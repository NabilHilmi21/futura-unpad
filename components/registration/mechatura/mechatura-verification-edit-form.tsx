import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import type { FieldPath, UseFormTrigger } from "react-hook-form";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { FormSelectField } from "@/components/form/form-select-field";
import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { mechaturaCompetitionOptions } from "@/lib/mechatura/options";
import {
  MECHATURA_EDITABLE_FIELDS,
  type MechaturaFormValues,
} from "@/lib/validation/mechatura";

type MechaturaVerificationEditFormProps = {
  documentMaxSizeInBytes: number;
  flashDoneButton: boolean;
  trigger: UseFormTrigger<MechaturaFormValues>;
  onDone: () => void;
};

type EditSectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

type CompactFileFieldName = "member_document" | "robot_document";

const editableFields =
  MECHATURA_EDITABLE_FIELDS as FieldPath<MechaturaFormValues>[];

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const size = bytes / 1024 ** exponent;
  const digits = size >= 10 || exponent === 0 ? 0 : 1;

  return `${size.toFixed(digits)} ${units[exponent]}`;
}

function getFiles(value: unknown) {
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value);
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return [value];
  }

  return [];
}

function EditSection({ title, action, children }: EditSectionProps) {
  return (
    <section className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function CompactFileEditField({
  name,
  label,
  accept,
  maxSizeInBytes,
}: {
  name: CompactFileFieldName;
  label: string;
  accept: string;
  maxSizeInBytes: number;
}) {
  const { control } = useFormContext<MechaturaFormValues>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = `${name}-verification-file`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const files = getFiles(field.value);
        const hasFiles = files.length > 0;

        const updateFiles = (event: ChangeEvent<HTMLInputElement>) => {
          field.onChange(event.currentTarget.files);
        };

        const deleteFiles = () => {
          if (inputRef.current) {
            inputRef.current.value = "";
          }

          field.onChange(null);
        };

        return (
          <Field className="gap-2">
            <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
            <input
              id={inputId}
              type="file"
              accept={accept}
              name={field.name}
              className="sr-only"
              ref={(element) => {
                inputRef.current = element;
                field.ref(element);
              }}
              onBlur={field.onBlur}
              onChange={updateFiles}
            />

            <div
              className={cn(
                "flex flex-col gap-3 rounded-[8px] border bg-muted/20 p-3 sm:flex-row sm:items-center",
                fieldState.error && "border-destructive bg-destructive/5"
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                  <FileText className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {hasFiles
                      ? files.map((file) => file.name).join(", ")
                      : "Belum ada file yang dipilih"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {hasFiles
                      ? files.map((file) => formatFileSize(file.size)).join(" + ")
                      : `Pilih file PDF, maksimal ${formatFileSize(maxSizeInBytes)}.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 sm:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                >
                  <Pencil className="size-4" />
                  {hasFiles ? "Edit" : "Upload"}
                </Button>
                {hasFiles ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label={`Hapus ${label}`}
                    onClick={deleteFiles}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>

            {fieldState.error ? (
              <FieldError>{String(fieldState.error.message)}</FieldError>
            ) : null}
          </Field>
        );
      }}
    />
  );
}

export default function MechaturaVerificationEditForm({
  documentMaxSizeInBytes,
  flashDoneButton,
  trigger,
  onDone,
}: MechaturaVerificationEditFormProps) {
  const { clearErrors, control, setValue } =
    useFormContext<MechaturaFormValues>();
  const hasCoach = useWatch({ control, name: "has_coach" });
  const member2Name = useWatch({ control, name: "member2_name" });
  const member2Email = useWatch({ control, name: "member2_email" });
  const member2Phone = useWatch({ control, name: "member2_phone" });
  const member3Name = useWatch({ control, name: "member3_name" });
  const member3Email = useWatch({ control, name: "member3_email" });
  const member3Phone = useWatch({ control, name: "member3_phone" });

  const hasMember2Value = Boolean(member2Name || member2Email || member2Phone);
  const hasMember3Value = Boolean(member3Name || member3Email || member3Phone);
  const [isAddingMember2, setIsAddingMember2] = useState(false);
  const [isAddingMember3, setIsAddingMember3] = useState(false);
  const showMember2 = hasMember2Value || isAddingMember2;
  const showMember3 = hasMember3Value || isAddingMember3;

  const handleDone = async () => {
    const isValid = await trigger(editableFields);

    if (isValid) {
      onDone();
    }
  };

  const clearMember2 = () => {
    setValue("member2_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("member2_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("member2_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["member2_name", "member2_email", "member2_phone"]);
    setIsAddingMember2(false);
  };

  const clearMember3 = () => {
    setValue("member3_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("member3_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("member3_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["member3_name", "member3_email", "member3_phone"]);
    setIsAddingMember3(false);
  };

  const addCoach = () => {
    setValue("has_coach", true, { shouldDirty: true, shouldValidate: true });
  };

  const removeCoach = () => {
    setValue("has_coach", false, { shouldDirty: true, shouldValidate: true });
    setValue("coach_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["coach_name", "coach_email", "coach_phone"]);
  };

  return (
    <div className="mt-5 space-y-5">
      <EditSection title="Tipe Robot">
        <FormSelectField<MechaturaFormValues>
          name="competition_type"
          label="Kategori Lomba"
          options={mechaturaCompetitionOptions}
          required
        />
      </EditSection>

      <EditSection title="Identitas Tim">
        <FormTextField<MechaturaFormValues>
          name="team_name"
          label="Nama Tim"
          placeholder="Masukkan nama tim anda"
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormTextField<MechaturaFormValues>
            name="institution"
            label="Asal Institusi"
            placeholder="Nama sekolah, kampus atau instansi"
            autoComplete="organization"
            required
          />
          <FormTextField<MechaturaFormValues>
            name="province"
            label="Provinsi/Kota"
            placeholder="Provinsi atau kota asal institusi"
            autoComplete="organization"
            required
          />
        </div>
      </EditSection>

      <EditSection title="Ketua Tim">
        <FormTextField<MechaturaFormValues>
          name="leader_name"
          label="Nama Ketua Tim"
          placeholder="Masukkan nama ketua tim anda"
          required
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormTextField<MechaturaFormValues>
            name="leader_email"
            label="Email Ketua Tim"
            placeholder="Masukkan email ketua tim anda"
            required
          />
          <FormTextField<MechaturaFormValues>
            name="leader_phone"
            label="No. WhatsApp Ketua Tim"
            placeholder="Masukkan nomor WhatsApp ketua tim anda"
            required
          />
        </div>
      </EditSection>

      <EditSection
        title="Anggota 1"
        action={
          showMember2 ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label="Hapus anggota 1"
              onClick={clearMember2}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMember2(true)}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          )
        }
      >
        {showMember2 ? (
          <>
            <FormTextField<MechaturaFormValues>
              name="member2_name"
              label="Nama Anggota 1"
              placeholder="Masukkan nama anggota"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormTextField<MechaturaFormValues>
                name="member2_email"
                label="Email Anggota 1"
                placeholder="Masukkan email anggota"
              />
              <FormTextField<MechaturaFormValues>
                name="member2_phone"
                label="No. WhatsApp Anggota 1"
                placeholder="Masukkan nomor WhatsApp anggota"
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada anggota 1 yang ditambahkan.
          </p>
        )}
      </EditSection>

      <EditSection
        title="Anggota 2"
        action={
          showMember3 ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label="Hapus anggota 2"
              onClick={clearMember3}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingMember3(true)}
            >
              <Plus className="size-4" />
              Tambah
            </Button>
          )
        }
      >
        {showMember3 ? (
          <>
            <FormTextField<MechaturaFormValues>
              name="member3_name"
              label="Nama Anggota 2"
              placeholder="Masukkan nama anggota"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormTextField<MechaturaFormValues>
                name="member3_email"
                label="Email Anggota 2"
                placeholder="Masukkan email anggota"
              />
              <FormTextField<MechaturaFormValues>
                name="member3_phone"
                label="No. WhatsApp Anggota 2"
                placeholder="Masukkan nomor WhatsApp anggota"
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Belum ada anggota 2 yang ditambahkan.
          </p>
        )}
      </EditSection>

      <EditSection
        title="Pembina"
        action={
          hasCoach ? (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label="Hapus pembina"
              onClick={removeCoach}
            >
              <Trash2 className="size-4" />
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={addCoach}>
              <Plus className="size-4" />
              Tambah
            </Button>
          )
        }
      >
        {hasCoach ? (
          <>
            <FormTextField<MechaturaFormValues>
              name="coach_name"
              label="Nama Pembina Tim"
              placeholder="Masukkan nama pembina tim anda"
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <FormTextField<MechaturaFormValues>
                name="coach_email"
                label="Email Pembina Tim"
                placeholder="Masukkan email pembina tim anda"
                required
              />
              <FormTextField<MechaturaFormValues>
                name="coach_phone"
                label="No. WhatsApp Pembina Tim"
                placeholder="Masukkan nomor WhatsApp pembina tim anda"
                required
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tim tidak menambahkan pembina.
          </p>
        )}
      </EditSection>

      <EditSection title="Lampiran">
        <CompactFileEditField
          name="member_document"
          label="Dokumen Anggota"
          accept="application/pdf"
          maxSizeInBytes={documentMaxSizeInBytes}
        />
        <FormTextField<MechaturaFormValues>
          name="robot_name"
          label="Nama Robot Tim"
          placeholder="Masukkan nama robot tim anda"
          required
        />
        <CompactFileEditField
          name="robot_document"
          label="Dokumen Robot"
          accept="application/pdf"
          maxSizeInBytes={documentMaxSizeInBytes}
        />
      </EditSection>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className={cn(
          "rounded-[8px] transition-colors duration-300",
          flashDoneButton &&
            "bg-destructive/80 text-white hover:bg-destructive/90"
        )}
        onClick={handleDone}
      >
        Done Editing
      </Button>
    </div>
  );
}
