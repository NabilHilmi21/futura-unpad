"use client";

import { useRouter } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { useToggleMechaturaAttendanceMutation } from "@/hooks/mutations/use-admin-mutations";

type MechaturaAttendanceToggleProps = {
  registrationId: string;
  attended: boolean;
  label?: string;
};

export default function MechaturaAttendanceToggle({
  registrationId,
  attended,
  label = "Team checked in",
}: MechaturaAttendanceToggleProps) {
  const router = useRouter();
  const toggleAttendance = useToggleMechaturaAttendanceMutation();

  const handleToggle = async (checked: boolean | "indeterminate") => {
    await toggleAttendance.mutateAsync({
      registration_id: registrationId,
      attended: checked === true,
    });
    router.refresh();
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Checkbox
        checked={attended}
        disabled={toggleAttendance.isPending}
        aria-label={label}
        onCheckedChange={handleToggle}
      />
    </div>
  );
}
