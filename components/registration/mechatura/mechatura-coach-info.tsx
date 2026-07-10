import { useFormContext, useWatch } from "react-hook-form";

import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import type { MechaturaFormValues } from "@/lib/validation/mechatura";

import { Trash2 } from "lucide-react";

export default function MechaturaCoachInfo() {
  const { control, clearErrors, setValue } = useFormContext<MechaturaFormValues>();
  const hasCoach = useWatch({ control, name: "has_coach" });

  const addCoach = () => {
    setValue("has_coach", true, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const removeCoach = () => {
    setValue("has_coach", false, { shouldDirty: true, shouldValidate: true });
    setValue("coach_name", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_email", "", { shouldDirty: true, shouldValidate: true });
    setValue("coach_phone", "", { shouldDirty: true, shouldValidate: true });
    clearErrors(["coach_name", "coach_email", "coach_phone"]);
  };

  return (
    <section
      className="overflow-hidden rounded-xl border border-border bg-card"
      aria-labelledby="coach-section-label"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border p-8">
        <div>
          <h2 id="coach-section-label" className="text-lg font-semibold">
            Identitas pembina tim
          </h2>
          <p className="mt-1 text-sm font-medium leading-relaxed text-neutral-500">
            Tambahkan pembina jika tim anda memiliki pembina.
          </p>
        </div>
        {hasCoach ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-[8px] bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700"
            onClick={removeCoach}
            >
                <Trash2 className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            className="h-10 rounded-[8px]"
            onClick={addCoach}
          >
            Tambah Pembina
          </Button>
        )}
      </div>

      <div className="space-y-6 p-8">
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
              placeholder="Masukkan nama WhatsApp pembina tim anda"
              required
            />
          </div>
        </>
      ) : null}
      </div>
    </section>
  );
}
