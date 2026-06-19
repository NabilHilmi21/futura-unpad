"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

type EditProfileDialogProps = {
  initialDisplayName: string
  initialEmail: string
}

export function EditProfileDialog({ initialDisplayName, initialEmail }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closed
      setDisplayName(initialDisplayName)
      setEmail(initialEmail)
      setError(null)
      setSuccessMessage(null)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const supabase = createClient()
    const updates: any = {}

    if (displayName !== initialDisplayName) {
      updates.data = { display_name: displayName }
    }

    const emailChanged = email !== initialEmail
    if (emailChanged) {
      updates.email = email
    }

    if (Object.keys(updates).length === 0) {
      setOpen(false)
      setIsLoading(false)
      return
    }

    try {
      const { data, error: updateError } = await supabase.auth.updateUser(updates)

      if (updateError) {
        throw updateError
      }

      if (emailChanged) {
        setSuccessMessage("A confirmation link has been sent to both your current and new email addresses. Please verify both to finalize the change.")
        // Do not close immediately so they can read the message
      } else {
        router.refresh()
        setOpen(false)
      }
    } catch (err: any) {
      let errorMessage = err.message || "Failed to update profile."
      if (errorMessage.toLowerCase().includes("invalid email")) {
        errorMessage = "Please enter a valid email address."
      } else if (errorMessage.toLowerCase().includes("already registered") || errorMessage.toLowerCase().includes("already exists")) {
        errorMessage = "This email address is already in use by another account."
      } else if (errorMessage.toLowerCase().includes("same as the old email")) {
        errorMessage = "You are already using this email address."
      } else if (errorMessage.toLowerCase().includes("rate limit")) {
        errorMessage = "Too many attempts. Please try again later."
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="absolute top-4 right-4 h-8 gap-2">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              A confirmation link will be sent to your current and new email addresses to verify the change.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              {successMessage}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
