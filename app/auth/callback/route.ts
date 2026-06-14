import { NextResponse } from "next/server"
import {
    PASSWORD_RECOVERY_COOKIE,
    PASSWORD_RECOVERY_MAX_AGE_SECONDS,
    passwordRecoveryCookieOptions,
} from "@/lib/password-recovery"
import { createClient } from "@/utils/supabase/server"

const getSafeRedirectPath = (value: string | null) => {
    if (
        !value ||
        !value.startsWith("/") ||
        value.startsWith("//") ||
        value.startsWith("/auth/callback")
    ) {
        return "/"
    }

    return value
}

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const next = getSafeRedirectPath(requestUrl.searchParams.get("next"))
    const isPasswordRecoveryRedirect =
        new URL(next, requestUrl.origin).pathname === "/reset-password"

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url))
    }

    const response = NextResponse.redirect(new URL(next, request.url))

    if (isPasswordRecoveryRedirect) {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
            ...passwordRecoveryCookieOptions,
            maxAge: PASSWORD_RECOVERY_MAX_AGE_SECONDS,
        })
    } else {
        response.cookies.set(PASSWORD_RECOVERY_COOKIE, "", {
            ...passwordRecoveryCookieOptions,
            maxAge: 0,
        })
    }

    return response
}
