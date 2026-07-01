"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ExpiredRegistrationDialogProps = {
  teamName: string;
};

export default function ExpiredRegistrationDialog({
  teamName,
}: ExpiredRegistrationDialogProps) {
  const [open, setOpen] = useState(true);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Payment window expired</AlertDialogTitle>
          <AlertDialogDescription>
            The payment window for {teamName} has ended. Your previous
            Mechatura team registration has been reset, so you can submit a new
            registration from the beginning.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Start new registration</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
