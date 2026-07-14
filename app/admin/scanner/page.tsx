import { requireAdminOrRedirect } from "@/lib/auth"
import ScannerClient from "./scanner-client"

export default async function ScannerPage() {
    await requireAdminOrRedirect()
    return <ScannerClient />
}
