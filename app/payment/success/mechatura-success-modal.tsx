"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function MechaturaSuccessModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Slight delay so it pops up gracefully after page load
    const timer = setTimeout(() => setOpen(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Successful!</DialogTitle>
          <DialogDescription>
            Your Mechatura registration payment has been successfully verified.
            You can always download your receipt and ticket later in your profile page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2 sm:justify-start">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            Understood
          </Button>
          <Button type="button" asChild className="w-full sm:w-auto">
            <Link href="/profile">Go to Profile</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
