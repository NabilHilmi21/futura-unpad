"use client"

import { useState, useEffect } from "react"
import { useRouter } from "nextjs-toploader/app"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { useResetPasswordMutation } from "@/hooks/mutations/use-auth-mutations"
import { resetPasswordSchema } from "@/lib/validation"
import { cn } from "@/lib/utils"
import { FormTextField } from "@/components/form/form-text-field"

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length > 0) score = 1;
    if (pwd.length >= 6) score = 2;
    if (pwd.length >= 8 && /[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd)) score = 3;
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score = 4;
    return score;
};

export default function ResetPasswordForm() {
    const router = useRouter()
    const resetPassword = useResetPasswordMutation()
    const [submitError, setSubmitError] = useState("")

    useEffect(() => {
        const channel = new window.BroadcastChannel('auth-sync');
        channel.postMessage('email_verified');
        channel.close();
    }, []);

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    })

    const { handleSubmit, watch } = form
    const passwordValue = watch("password")
    const passwordStrength = getPasswordStrength(passwordValue)

    const onSubmit = async (values: ResetPasswordFormValues) => {
        setSubmitError("")
        try {
            await resetPassword.mutateAsync(values)
            window.location.href = "/login?reset=success";
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Password update failed. Please request a new reset link.")
        }
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center space-y-10 px-6 pb-16 pt-32 sm:px-8">
            <section className="space-y-2">
                <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                    Create a new password
                </h1>
                <p className="text-sm font-medium leading-relaxed text-neutral-500">
                    Use at least 8 characters. After updating, you will sign in again.
                </p>
            </section>

            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <FieldGroup className="gap-5">
                        <Field className="gap-2">
                            <FormTextField<ResetPasswordFormValues>
                                name="password"
                                label="New password"
                                type="password"
                                placeholder="Enter a new password"
                                autoComplete="new-password"
                            />

                            {/* Password Strength Indicator */}
                            <div className="mt-1 flex gap-1">
                                {[1, 2, 3, 4].map((bar) => (
                                    <div
                                        key={bar}
                                        className={cn(
                                            "h-1 flex-1 rounded-full transition-all duration-300",
                                            passwordStrength >= bar
                                                ? passwordStrength === 1
                                                    ? "bg-destructive"
                                                    : passwordStrength === 2
                                                        ? "bg-orange-500"
                                                        : passwordStrength === 3
                                                            ? "bg-yellow-500"
                                                            : "bg-emerald-500"
                                                : "bg-muted-foreground/20"
                                        )}
                                    />
                                ))}
                            </div>
                            {passwordStrength > 0 && (
                                <p className={cn(
                                    "text-xs font-medium text-right transition-colors duration-300",
                                    passwordStrength === 1 ? "text-destructive" :
                                        passwordStrength === 2 ? "text-orange-500" :
                                            passwordStrength === 3 ? "text-yellow-500" :
                                                "text-emerald-500"
                                )}>
                                    {passwordStrength === 1 ? "Very Weak" : passwordStrength === 2 ? "Weak" : passwordStrength === 3 ? "Strong" : "Very Strong"}
                                </p>
                            )}
                        </Field>

                        <FormTextField<ResetPasswordFormValues>
                            name="confirmPassword"
                            label="Confirm password"
                            type="password"
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                        />

                        {submitError ? (
                            <p className="rounded-[8px] border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                                {submitError}
                            </p>
                        ) : null}

                        <Field className="gap-3">
                            <Button
                                type="submit"
                                className="h-11 rounded-[8px]"
                                disabled={resetPassword.isPending}
                            >
                                {resetPassword.isPending ? "Updating password..." : "Update password"}
                            </Button>
                        </Field>
                    </FieldGroup>
                </form>
            </FormProvider>
        </main>
    )
}
