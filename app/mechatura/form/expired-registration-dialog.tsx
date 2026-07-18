"use client";

import { useState, useTransition } from "react";
import { deleteExpiredRegistration } from "./actions";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

type ExpiredRegistrationDialogProps = {
  teamName: string;
  registrationId: string;
};

export default function ExpiredRegistrationDialog({
  teamName,
  registrationId,
}: ExpiredRegistrationDialogProps) {
  const [open, setOpen] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await deleteExpiredRegistration(registrationId);
      setOpen(false);
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={isPending ? undefined : setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batas waktu pembayaran telah berakhir</AlertDialogTitle>
          <AlertDialogDescription>
            Batas waktu pembayaran untuk {teamName} telah berakhir. Pendaftaran tim Mechatura Anda sebelumnya telah diatur ulang, sehingga Anda dapat mengirimkan pendaftaran baru dari awal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mulai pendaftaran baru
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
