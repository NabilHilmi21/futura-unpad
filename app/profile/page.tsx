import Link from "next/link"
import { redirect } from "next/navigation"
import { CalendarDays, Mail, ShieldCheck, Ticket, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatCurrency,
  isAcademicStatus,
  isMechaturaCompetitionType,
  isPaymentStatus,
  mechaturaCompetitionLabels,
  paymentStatusLabels,
  statusLabels,
} from "@/lib/payment"
import { createAdminClient } from "@/lib/supabase-admin"
import { createClient } from "@/utils/supabase/server"

type ProfileRegistration = {
  nama_lengkap: string
  email: string
  no_telepon: string
  asal_institusi: string
  status_akademika: unknown
  created_at: string | null
}

type ProfileMechaturaRegistration = {
  id: string
  team_name: string
  competition_type: unknown
  robot_name: string
  registration_status: string | null
  payment_status: string | null
  payment_amount: number | null
  xendit_external_id: string
  created_at: string | null
}

type ProfileMechaturaLeader = {
  full_name: string
  email: string | null
  phone: string | null
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/profile")
  }

  const adminSupabase = createAdminClient()
  const [
    { data: adminUser },
    { data: latestRegistration, error },
    { data: latestMechaturaRegistration, error: mechaturaError },
  ] =
    await Promise.all([
      supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      adminSupabase
        .from("seminar_registrations")
        .select(
          "nama_lengkap,email,no_telepon,asal_institusi,status_akademika,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileRegistration>(),
      adminSupabase
        .from("mechatura_registrations")
        .select(
          "id,team_name,competition_type,robot_name,registration_status,payment_status,payment_amount,xendit_external_id,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<ProfileMechaturaRegistration>(),
    ])

  if (error || mechaturaError) {
    throw new Error(error?.message ?? mechaturaError?.message)
  }

  const { data: mechaturaLeader } = latestMechaturaRegistration
    ? await adminSupabase
        .from("mechatura_members")
        .select("full_name,email,phone")
        .eq("registration_id", latestMechaturaRegistration.id)
        .eq("is_leader", true)
        .maybeSingle<ProfileMechaturaLeader>()
    : { data: null }

  const academicStatus = isAcademicStatus(latestRegistration?.status_akademika)
    ? latestRegistration.status_akademika
    : null
  const mechaturaPaymentStatus = isPaymentStatus(
    latestMechaturaRegistration?.payment_status
  )
    ? latestMechaturaRegistration.payment_status
    : "unpaid"
  const mechaturaCompetition = isMechaturaCompetitionType(
    latestMechaturaRegistration?.competition_type
  )
    ? latestMechaturaRegistration.competition_type
    : null

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-12 sm:px-8">
      <section className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Profile</p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance">
            Your Futura account
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Review your account details and your latest registrations.
          </p>
        </div>
        <Button asChild className="h-10 rounded-xl">
          <Link href="/transactions">View transactions</Link>
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <h2 className="font-semibold">Account details</h2>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="break-all font-medium">{user.email ?? "-"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{adminUser ? "Admin" : "Participant"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Account created</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Ticket className="h-5 w-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="font-semibold">Latest seminar registration</h2>
              <p className="text-sm text-muted-foreground">
                {latestRegistration
                  ? `Created ${formatDate(latestRegistration.created_at)}`
                  : "No linked registration yet."}
              </p>
            </div>
          </div>

          {latestRegistration ? (
            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{latestRegistration.nama_lengkap}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">{latestRegistration.no_telepon}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">{latestRegistration.asal_institusi}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium">
                  {academicStatus ? statusLabels[academicStatus] : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Fee</p>
                <p className="font-medium">Free</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              You have not registered for a seminar while signed in yet.
              <Button asChild className="mt-4 h-10 rounded-xl">
                <Link href="/registration">Register now</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Ticket className="h-5 w-5 text-muted-foreground" />
          </span>
          <div>
            <h2 className="font-semibold">Latest Mechatura registration</h2>
            <p className="text-sm text-muted-foreground">
              {latestMechaturaRegistration
                ? `Created ${formatDate(latestMechaturaRegistration.created_at)}`
                : "No linked Mechatura team yet."}
            </p>
          </div>
        </div>

        {latestMechaturaRegistration ? (
          <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Team</p>
              <p className="font-medium">{latestMechaturaRegistration.team_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">
                {mechaturaCompetition
                  ? mechaturaCompetitionLabels[mechaturaCompetition]
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Robot</p>
              <p className="font-medium">{latestMechaturaRegistration.robot_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Leader</p>
              <p className="font-medium">{mechaturaLeader?.full_name ?? "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Registration</p>
              <p className="font-medium">
                {latestMechaturaRegistration.registration_status ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Payment</p>
              <p className="font-medium">
                {paymentStatusLabels[mechaturaPaymentStatus]}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-medium">
                {formatCurrency(latestMechaturaRegistration.payment_amount ?? 0)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <Button asChild variant="outline" className="h-10 rounded-xl">
                <Link
                  href={`/payment?order_id=${encodeURIComponent(
                    latestMechaturaRegistration.xendit_external_id
                  )}`}
                >
                  Open payment details
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            You have not registered a Mechatura team while signed in yet.
            <Button asChild className="mt-4 h-10 rounded-xl">
              <Link href="/registration/mechatura">Register Mechatura</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}
