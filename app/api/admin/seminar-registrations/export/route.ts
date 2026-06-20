import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
    const { user, isAdmin } = await requireAdmin()

    if (!user || !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminSupabase = createAdminClient()
    
    // Fetch all registrations, order by group_id so members are next to their main contact
    // then by created_at
    const { data: registrations, error } = await adminSupabase
        .from("seminar_registrations")
        .select("*")
        .order("group_id", { ascending: true })
        .order("is_main_contact", { ascending: false })
        .order("created_at", { ascending: true })

    if (error) {
        return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 })
    }

    // Group registrations by group_id so each submission is exactly 1 row
    const groupedRegistrations = new Map<string, any>()
    const individualRegistrations: any[] = []

    for (const reg of registrations) {
        if (reg.group_id) {
            if (!groupedRegistrations.has(reg.group_id)) {
                groupedRegistrations.set(reg.group_id, { main: null, members: [] })
            }
            const group = groupedRegistrations.get(reg.group_id)
            if (reg.is_main_contact) {
                group.main = reg
            } else {
                group.members.push(reg)
            }
        } else {
            individualRegistrations.push({ main: reg, members: [] })
        }
    }

    // Combine them into a single array, filtering out any anomalous groups without a main contact
    const allGrouped = [...individualRegistrations, ...Array.from(groupedRegistrations.values())]
        .filter(g => g.main !== null)

    // CSV Header
    const headers = [
        "Registration ID",
        "Registration Type",
        "Name (Main Contact)",
        "Email",
        "Phone",
        "Institution",
        "Status Akademika",
        "Registered At",
        "Group Members", // Collapsed list of members
    ]

    // Convert data to CSV rows
    const rows = allGrouped.map(({ main, members }) => {
        const type = main.registration_type === "grup" || main.registration_type === "group" ? "Group" : "Individual"
        const date = main.created_at ? new Date(main.created_at).toISOString() : ""

        // Format members into a clean, numbered list separated by newlines
        // Example: "1. John Doe (Telkom University)\n2. Jane Doe (ITB)"
        const membersString = members.map((m: any, i: number) => 
            `${i + 1}. ${m.nama_lengkap} (${m.asal_institusi || "-"})`
        ).join("\n")

        // Escape fields that might contain commas or newlines
        const escapeCSV = (field: string | null | undefined) => {
            if (!field) return ""
            const stringField = String(field)
            if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
                return `"${stringField.replace(/"/g, '""')}"`
            }
            return stringField
        }

        return [
            escapeCSV(main.id),
            escapeCSV(type),
            escapeCSV(main.nama_lengkap),
            escapeCSV(main.email),
            escapeCSV(main.no_telepon),
            escapeCSV(main.asal_institusi),
            escapeCSV(main.status_akademika),
            escapeCSV(date),
            escapeCSV(membersString),
        ].join(",")
    })

    const csvContent = [headers.join(","), ...rows].join("\n")

    return new NextResponse(csvContent, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="seminar-registrations-${new Date().toISOString().split('T')[0]}.csv"`,
        },
    })
}
