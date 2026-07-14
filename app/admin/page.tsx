export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

import {
    CheckCircle2,
    Clock3,
    Users,
} from "lucide-react"
import { createAdminClient } from "@/lib/supabase-admin"
import { requireAdminOrRedirect } from "@/lib/auth"
import { isCompletedPaymentStatus } from "@/lib/payment"
import { Suspense } from "react"
import AdminLoading from "./admin-loading"

async function AdminDashboardData() {
    const { user } = await requireAdminOrRedirect()
    const adminSupabase = createAdminClient()

    const getCount = async (table: string, filters: Record<string, string> = {}, inFilter?: { column: string; values: string[] }) => {
        let query = adminSupabase.from(table).select("*", { count: 'exact', head: true })
        for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value)
        }
        if (inFilter) {
            query = query.in(inFilter.column, inFilter.values)
        }
        const { count, error } = await query;
        if (error) throw new Error(error.message);
        return count ?? 0;
    }

    const [
        totalRegistrations,
        mahasiswaCount,
        siswaCount,
        dosenCount,
        umumCount,
        totalMechaturaCount,
        mechaturaPaidCount,
        sumoCount,
        transporterCount
    ] = await Promise.all([
        getCount("seminar_registrations"),
        getCount("seminar_registrations", { status_akademika: "mahasiswa" }),
        getCount("seminar_registrations", { status_akademika: "siswa" }),
        getCount("seminar_registrations", { status_akademika: "dosen" }),
        getCount("seminar_registrations", { status_akademika: "umum" }),
        getCount("mechatura_registrations"),
        getCount("mechatura_registrations", {}, { column: "payment_status", values: ["paid", "settled"] }),
        getCount("mechatura_registrations", { competition_type: "sumo" }),
        getCount("mechatura_registrations", { competition_type: "transporter" }),
    ])

    return (
        <div className="mx-auto w-full max-w-7xl space-y-8">
            <section className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Admin Dashboard
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-3xl sm:text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
                            Futura Overview
                        </h1>
                        <p className="max-w-xl text-sm font-medium leading-relaxed text-neutral-500">
                            Welcome back, {user.email}. Monitor registration progress and
                            payment health from one place. Navigate to specific events using the top navigation.
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Seminar</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Registrations</p>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {totalRegistrations}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Mahasiswa</p>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {mahasiswaCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Siswa</p>
                            <Clock3 className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {siswaCount}
                        </p>
                    </div>

                    <div className="rounded-xl border border-border p-5">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">Dosen / Umum</p>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {dosenCount} / {umumCount}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Mechatura</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {totalMechaturaCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {mechaturaPaidCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Sumo</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {sumoCount}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Robot Transporter</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight">
                            {transporterCount}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-5">Lomba Karya Tulis Ilmiah</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Total Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight text-muted-foreground">
                            -
                        </p>
                    </div>
                    <div className="rounded-xl border border-border p-5">
                        <p className="text-sm text-muted-foreground">Paid Teams</p>
                        <p className="mt-4 text-3xl font-semibold tracking-tight text-muted-foreground">
                            -
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default function AdminPage() { return <Suspense fallback={<AdminLoading />}><AdminDashboardData /></Suspense> }
