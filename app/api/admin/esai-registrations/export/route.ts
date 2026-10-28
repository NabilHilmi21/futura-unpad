import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/http";
import {
    toSearchPattern,
    subthemeMap,
    submissionFilters,
    categoryFilters,
    subthemeFilters,
    normalizeFilter
} from "@/app/admin/lomba-esai/_lib/esai-utils";

export const dynamic = "force-dynamic";

const escapeCSV = (field: string | number | null | undefined) => {
    if (field === null || field === undefined) return "";
    // Remove null bytes to prevent parser truncation attacks
    let stringField = String(field).replace(/\0/g, "");
    
    // Prevent CSV Formula Injection (OWASP mitigation)
    const isFormula = /^[=+\-@\t\r|]/.test(stringField.trimStart());
    if (isFormula) {
        stringField = "'" + stringField;
    }

    // Always quote fields that contain special characters or formula characters
    if (isFormula || stringField.includes(",") || stringField.includes(";") || stringField.includes('"') || stringField.includes("\n") || stringField.includes("\r")) {
        return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
};

const allAvailableCols = [
    "id",
    "user_id",
    "created_at",
    "full_name",
    "institution",
    "institution_category",
    "city",
    "email",
    "phone_number",
    "paper_title",
    "sub_theme",
    "submission_status",
    "essay_paper_url",
    "identity_card_url",
    "instagram_twibbon_url",
    "payment_proof_url",
];

const COLUMN_HEADERS: Record<string, string> = {
    id: "ID Pendaftaran",
    user_id: "User ID",
    created_at: "Waktu Pendaftaran",
    full_name: "Nama Lengkap",
    institution: "Instansi",
    institution_category: "Kategori Instansi",
    city: "Kota",
    email: "Email",
    phone_number: "No. WA",
    paper_title: "Judul Karya Esai",
    sub_theme: "Subtema",
    submission_status: "Status Pengumpulan",
    essay_paper_url: "File Naskah Esai",
    identity_card_url: "File KTM / Identitas",
    instagram_twibbon_url: "File Bukti Twibbon",
    payment_proof_url: "File Bukti Pembayaran",
};

export async function GET(request: Request) {
    try {
        const { user, adminAccess } = await requireAdmin(); 
        if (!user || !adminAccess) return new NextResponse("Unauthorized", { status: 401 });

        const limit = await rateLimit(user.id, {
            key: "admin-export-esai",
            limit: 15,
            windowSeconds: 60,
        });

        if (!limit.success) {
            return rateLimited(limit.retryAfter);
        }

        const { searchParams } = new URL(request.url);
        
        const search = searchParams.get("search");
        const submission = searchParams.get("submission");
        const category = searchParams.get("category");
        const subtheme = searchParams.get("subtheme");
        const cols = searchParams.get("cols");

        const submissionFilter = normalizeFilter(submission ?? undefined, submissionFilters, "all");
        const categoryFilter = normalizeFilter(category ?? undefined, categoryFilters, "all");
        const subthemeFilter = normalizeFilter(subtheme ?? undefined, subthemeFilters, "all");

        const supabaseAdmin = createAdminClient();
        const searchPattern = search ? toSearchPattern(search.trim()) : null;

        const buildQuery = () => {
            let query = supabaseAdmin.from("esai_registrations").select("*");

            if (submissionFilter !== "all") {
                query = query.eq("submission_status", submissionFilter);
            }

            if (categoryFilter !== "all") {
                query = query.eq("institution_category", categoryFilter);
            }

            if (subthemeFilter !== "all") {
                const mapped = subthemeMap[subthemeFilter];
                if (mapped) {
                    query = query.ilike("sub_theme", mapped.pattern);
                }
            }

            if (searchPattern) {
                query = query.or(`full_name.ilike.${searchPattern},institution.ilike.${searchPattern},email.ilike.${searchPattern}`);
            }

            return query;
        };

        const registrations: Record<string, unknown>[] = [];
        const batchSize = 1000;
        let offset = 0;

        while (true) {
            const { data, error } = await buildQuery()
                .order("created_at", { ascending: false })
                .range(offset, offset + batchSize - 1);

            if (error) {
                throw error;
            }

            registrations.push(...(data ?? []));
            if (!data || data.length < batchSize) break;
            offset += batchSize;
        }

        if (registrations.length === 0) {
            return new NextResponse("Tidak ada data untuk diekspor", { status: 404 });
        }

        // CSV Header
        const selectedCols = cols ? cols.split(",").filter(c => allAvailableCols.includes(c)) : allAvailableCols;
        const validSelectedCols = selectedCols.length > 0 ? selectedCols : allAvailableCols;

        let csvContent = validSelectedCols.map(col => escapeCSV(COLUMN_HEADERS[col] || col)).join(",") + "\r\n";

        // Fetch user metadata only for participants missing names or emails
        const usersNeedingFallback = Array.from(
            new Set(
                registrations
                    .filter((r) => !String(r.full_name ?? "").trim() || !String(r.email ?? "").trim())
                    .map((r) => String(r.user_id || ""))
                    .filter(Boolean)
            )
        );

        const fallbackInfoByUserId = new Map<string, { name: string; email: string }>();

        if (usersNeedingFallback.length > 0) {
            if (usersNeedingFallback.length <= 5) {
                // If only a few users need fallback, fetch directly in parallel
                await Promise.all(
                    usersNeedingFallback.map(async (userId) => {
                        try {
                            const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
                            if (userData?.user) {
                                const meta = userData.user.user_metadata || {};
                                const name = meta.display_name?.trim() || 
                                             meta.username?.trim() || 
                                             userData.user.email?.trim() || 
                                             meta.full_name?.trim() || 
                                             meta.name?.trim() || 
                                             "";
                                fallbackInfoByUserId.set(userId, { name, email: userData.user.email || "" });
                            }
                        } catch {
                            // ignore
                        }
                    })
                );
            } else {
                // Bulk fetch users to avoid N+1 remote API calls and rate-limiting
                const neededSet = new Set(usersNeedingFallback);
                let authPage = 1;
                let hasNextAuthPage = true;
                while (hasNextAuthPage && fallbackInfoByUserId.size < neededSet.size && authPage <= 10) {
                    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
                        page: authPage,
                        perPage: 1000,
                    });
                    if (authError || !authData?.users?.length) break;
                    for (const u of authData.users) {
                        if (neededSet.has(u.id)) {
                            const meta = u.user_metadata || {};
                            const name = meta.display_name?.trim() || 
                                         meta.username?.trim() || 
                                         u.email?.trim() || 
                                         meta.full_name?.trim() || 
                                         meta.name?.trim() || 
                                         "";
                            fallbackInfoByUserId.set(u.id, { name, email: u.email || "" });
                        }
                    }
                    hasNextAuthPage = authData.users.length === 1000;
                    authPage++;
                }
            }
        }

        // CSV Rows
        registrations.forEach(row => {
            const fallback = fallbackInfoByUserId.get(String(row.user_id || ""));
            const rowData = validSelectedCols.map(col => {
                let val: string | number | null | undefined = row[col] as string | number | null | undefined;
                if (col === "full_name") {
                    const trimmed = val ? String(val).trim() : "";
                    val = trimmed || fallback?.name || "Tanpa Nama";
                } else if (col === "email") {
                    const trimmed = val ? String(val).trim() : "";
                    val = trimmed || fallback?.email || "";
                } else if (col === "created_at" && val) {
                    const d = new Date(String(val));
                    val = new Intl.DateTimeFormat("id-ID", {
                        timeZone: "Asia/Jakarta",
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit", second: "2-digit",
                        hour12: false
                    }).format(d).replace(/\./g, ":").replace(",", "");
                } else if (col === "submission_status") {
                    val = val === "approved" ? "Disetujui" : val === "submitted" ? "Submitted" : val === "draft" ? "Draft" : (val || "");
                } else if (col === "institution_category" && val) {
                    if (val === "perguruan_tinggi") {
                        val = "Perguruan Tinggi";
                    }
                }

                return escapeCSV(val);
            });
            csvContent += rowData.join(",") + "\r\n";
        });

        return new NextResponse("\uFEFF" + csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="data-peserta-esai-${new Date().toISOString().split("T")[0]}.csv"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return new NextResponse("Terjadi kesalahan saat mengekspor data", { status: 500 });
    }
}
