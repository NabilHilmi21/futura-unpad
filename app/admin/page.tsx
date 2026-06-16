import { redirect } from "next/navigation"
import Link from "next/link"
import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Monitor,
    Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAdminClient } from "@/lib/supabase-admin"
import {
    isMechaturaCompetitionType,
    isPaymentStatus,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment"
import { createClient } from "@/utils/supabase/server"

type AdminRegistration = {
    status_akademika: string | null
    created_at: string | null
}

type AdminMechaturaRegistration = {
    id: string
    team_id: string
    team_name: string
    institution: string
    competition_type: unknown
    robot_name: string
    registration_status: string | null
    payment_status: string | null
    payment_amount: number | null
    created_at: string | null
}

type AdminMechaturaLeader = {
    registration_id: string
    full_name: string
    email: string | null
}

const completedStatuses = new Set(["paid", "settled"])

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-zinc-100 text-zinc-700",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-neutral-100 text-neutral-700",
    settled: "bg-blue-100 text-blue-800",
}

const getStatus = (status: string | null) =>
    isPaymentStatus(status) ? status : "unpaid"

type AdminSearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminPage({
    searchParams,
}: {
    searchParams: AdminSearchParams
}) {
    const params = await searchParams
    const categoryParam = Array.isArray(params.category)
        ? params.category[0]
        : params.category
    const paymentParam = Array.isArray(params.payment)
        ? params.payment[0]
        : params.payment
    const searchParam = Array.isArray(params.search)
        ? params.search[0]
        : params.search
    const categoryFilter = isMechaturaCompetitionType(categoryParam)
        ? categoryParam
        : "all"
    const searchFilter = (searchParam ?? "").trim().toLowerCase()
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: adminUser } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

    if (!adminUser) {
        redirect("/")
    }

    const adminSupabase = createAdminClient()
    const [{ data, error }, { data: mechaturaData, error: mechaturaError }] =
        await Promise.all([
            adminSupabase
                .from("seminar_registrations")
                .select("status_akademika,created_at")
                .order("created_at", { ascending: false }),
            adminSupabase
                .from("mechatura_registrations")
                .select(
                    "id,team_id,team_name,institution,competition_type,robot_name,registration_status,payment_status,payment_amount,created_at"
                )
                .order("created_at", { ascending: false })
                .returns<AdminMechaturaRegistration[]>(),
        ])

    if (error || mechaturaError) {
        throw new Error(error?.message ?? mechaturaError?.message)
    }

    const registrations = (data ?? []) as AdminRegistration[]
    const totalRegistrations = registrations.length
    const mahasiswaCount = registrations.filter(
        (registration) => registration.status_akademika === "mahasiswa"
    ).length
    const siswaCount = registrations.filter(
        (registration) => registration.status_akademika === "siswa"
    ).length
    const dosenCount = registrations.filter(
        (registration) => registration.status_akademika === "dosen"
    ).length
    const umumCount = registrations.filter(
        (registration) => registration.status_akademika === "umum"
    ).length
    const paymentStatuses: PaymentStatus[] = [
        "unpaid",
        "pending",
        "paid",
        "settled",
        "failed",
        "expired",
        "cancelled",
    ]
    const paymentFilter = isPaymentStatus(paymentParam) ? paymentParam : "all"
    const mechaturaRegistrations = mechaturaData ?? []
    const { data: leaders } = mechaturaRegistrations.length
        ? await adminSupabase
            .from("mechatura_members")
            .select("registration_id,full_name,email")
            .in(
                "registration_id",
                mechaturaRegistrations.map((registration) => registration.id)
            )
            .eq("is_leader", true)
            .returns<AdminMechaturaLeader[]>()
        : { data: [] }
    const leaderByRegistrationId = new Map(
        (leaders ?? []).map((leader) => [leader.registration_id, leader])
    )
    const filteredMechaturaRegistrations = mechaturaRegistrations.filter(
        (registration) => {
            const leader = leaderByRegistrationId.get(registration.id)
            const categoryMatches =
                categoryFilter === "all" ||
                registration.competition_type === categoryFilter
            const paymentMatches =
                paymentFilter === "all" ||
                getStatus(registration.payment_status) === paymentFilter
            const searchMatches =
                !searchFilter ||
                [
                    registration.team_id,
                    registration.team_name,
                    registration.institution,
                    registration.robot_name,
                    leader?.full_name,
                    leader?.email,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(searchFilter))

            return categoryMatches && paymentMatches && searchMatches
        }
    )
    const mechaturaPaidCount = mechaturaRegistrations.filter((registration) =>
        completedStatuses.has(getStatus(registration.payment_status))
    ).length

    return (
        <main className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10 sm:px-8">
            <section className="flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">
                        Admin Dashboard
                    </p>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-semibold tracking-tight text-balance">
                            Futura seminar overview
                        </h1>
                        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                            Welcome back, {user.email}. Monitor registration progress,
                            payment health, and attendance distribution from one place.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button asChild className="h-10 rounded-xl">
                        <Link href="/seminar-list">
                            View participants
                            <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-10 rounded-xl">
                        <Link href="/registration">Open registration</Link>
                    </Button>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            </section>

            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border p-5">
                    <p className="text-sm text-muted-foreground">Mechatura teams</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {mechaturaRegistrations.length}
                    </p>
                </div>
                <div className="rounded-xl border border-border p-5">
                    <p className="text-sm text-muted-foreground">Mechatura paid</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {mechaturaPaidCount}
                    </p>
                </div>
                <div className="rounded-xl border border-border p-5">
                    <p className="text-sm text-muted-foreground">Robot Sumo</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {
                            mechaturaRegistrations.filter(
                                (registration) => registration.competition_type === "sumo"
                            ).length
                        }
                    </p>
                </div>
                <div className="rounded-xl border border-border p-5">
                    <p className="text-sm text-muted-foreground">Robot Transporter</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight">
                        {
                            mechaturaRegistrations.filter(
                                (registration) =>
                                    registration.competition_type === "transporter"
                            ).length
                        }
                    </p>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                        </span>
                        <div>
                            <h2 className="font-semibold">Audience Mix</h2>
                            <p className="text-sm text-muted-foreground">
                                Academic status from free seminar registrations.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-5">
                        {[
                            ["Mahasiswa", mahasiswaCount, "bg-blue-600"],
                            ["Siswa", siswaCount, "bg-emerald-600"],
                            ["Dosen", dosenCount, "bg-violet-600"],
                            ["Umum", umumCount, "bg-zinc-600"],
                        ].map(([label, count, color]) => {
                            const numericCount = Number(count)
                            const percentage =
                                totalRegistrations > 0
                                    ? (numericCount / totalRegistrations) * 100
                                    : 0

                            return (
                                <div key={label}>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">{label}</span>
                                        <span className="font-medium">{numericCount}</span>
                                    </div>
                                    <div className="mt-2 h-2 rounded-full bg-muted">
                                        <div
                                            className={`h-2 rounded-full ${color}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="rounded-xl border border-border p-5">
                    <h2 className="font-semibold">Seminar Registration</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        The seminar is free. Participant data is collected for
                        attendance and committee communication only.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-sm text-muted-foreground">Total</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">
                                {totalRegistrations}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border p-4">
                            <p className="text-sm text-muted-foreground">Fee</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">
                                Free
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-xl border border-border p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-semibold">Mechatura Teams</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Search and filter robotics competition registrations.
                        </p>
                    </div>
                    <form className="grid gap-3 sm:grid-cols-3 lg:min-w-[560px]" action="/admin">
                        <input
                            name="search"
                            defaultValue={searchParam ?? ""}
                            placeholder="Search team, robot, leader"
                            className="h-10 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <select
                            name="category"
                            defaultValue={categoryFilter}
                            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <option value="all">All categories</option>
                            <option value="sumo">Robot Sumo</option>
                            <option value="transporter">Robot Transporter</option>
                        </select>
                        <select
                            name="payment"
                            defaultValue={paymentFilter}
                            className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <option value="all">All payments</option>
                            {paymentStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {paymentStatusLabels[status]}
                                </option>
                            ))}
                        </select>
                        <Button className="h-10 rounded-xl sm:col-span-3 lg:col-span-1">
                            Apply filters
                        </Button>
                    </form>
                </div>

                <div className="mt-5 overflow-hidden rounded-xl border border-border">
                    <div className="hidden grid-cols-[1.2fr_1fr_1fr_120px_120px] gap-4 border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground lg:grid">
                        <span>Team</span>
                        <span>Category</span>
                        <span>Leader</span>
                        <span>Payment</span>
                        <span>Registration</span>
                    </div>
                    <div className="divide-y divide-border">
                        {filteredMechaturaRegistrations.length ? (
                            filteredMechaturaRegistrations.map((registration) => {
                                const leader = leaderByRegistrationId.get(registration.id)
                                const status = getStatus(registration.payment_status)
                                const category = isMechaturaCompetitionType(
                                    registration.competition_type
                                )
                                    ? mechaturaCompetitionLabels[registration.competition_type]
                                    : "-"

                                return (
                                    <article
                                        key={registration.id}
                                        className="grid gap-4 px-4 py-4 text-sm lg:grid-cols-[1.2fr_1fr_1fr_120px_120px] lg:items-center"
                                    >
                                        <div>
                                            <p className="font-medium">{registration.team_name}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {registration.team_id} / {registration.robot_name}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {registration.institution}
                                            </p>
                                        </div>
                                        <p>{category}</p>
                                        <div>
                                            <p className="font-medium">{leader?.full_name ?? "-"}</p>
                                            <p className="mt-1 break-all text-xs text-muted-foreground">
                                                {leader?.email ?? "-"}
                                            </p>
                                        </div>
                                        <span
                                            className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                                        >
                                            {paymentStatusLabels[status]}
                                        </span>
                                        <p className="text-muted-foreground">
                                            {registration.registration_status ?? "-"}
                                        </p>
                                    </article>
                                )
                            })
                        ) : (
                            <div className="p-6 text-sm text-muted-foreground">
                                No Mechatura teams match the current filters.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    )
}
