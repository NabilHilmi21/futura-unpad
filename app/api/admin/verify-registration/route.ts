import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"
import { invalidRequest, rateLimited, serverError } from "@/lib/http"
import { rateLimit } from "@/lib/rate-limit"
import { z } from "zod"

const verifyRegistrationSchema = z.object({
  registration_id: z.string().uuid()
})

export async function POST(request: Request) {
    const limit = await rateLimit(request, {
        key: "admin-verify-registration",
        limit: 30,
        windowSeconds: 60,
    })

    if (!limit.success) {
        return rateLimited(limit.retryAfter)
    }

    const { user, isAdmin } = await requireAdmin()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parsed = verifyRegistrationSchema.safeParse(await request.json().catch(() => null))

    if (!parsed.success) {
        return invalidRequest()
    }

    const adminSupabase = createAdminClient()
    
    // First find the registration
    const { data: registration, error: fetchError } = await adminSupabase
        .from("seminar_registrations")
        .select("id, nama_lengkap, attended")
        .eq("id", parsed.data.registration_id)
        .maybeSingle()

    if (fetchError || !registration) {
        return NextResponse.json({ error: "Registration not found" }, { status: 404 })
    }

    if (registration.attended) {
        return NextResponse.json({ error: "Participant already checked in" }, { status: 409 })
    }

    // Update attendance
    const { error: updateError } = await adminSupabase
        .from("seminar_registrations")
        .update({ 
            attended: true, 
            check_in_time: new Date().toISOString() 
        })
        .eq("id", registration.id)

    if (updateError) {
        console.error("Verification update failed", updateError.message)
        return serverError()
    }

    return NextResponse.json({ ok: true, participant: { nama_lengkap: registration.nama_lengkap } })
}
