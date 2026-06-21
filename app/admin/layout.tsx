import { requireAdminOrRedirect } from "@/lib/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await requireAdminOrRedirect()
    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    )
}
