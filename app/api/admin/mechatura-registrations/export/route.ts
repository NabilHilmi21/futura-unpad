import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { rateLimited } from "@/lib/http";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase-admin";
import {
    applyMechaturaFilters,
    categoryFilters,
    normalizeFilter,
    paymentFilters,
    submissionFilters,
    approvalFilters,
    batchFilters,
    toSearchPattern,
} from "@/app/admin/mechatura/_lib/mechatura-utils";
import { mechaturaCompetitionLabels, paymentStatusLabels } from "@/lib/payment";

export const dynamic = "force-dynamic";

type MechaturaTeamExport = {
    id: string;
    join_code: string;
    name: string;
    category: unknown;
    pembina_name?: string | null;
    pembina_phone?: string | null;
    payment_status?: string | null;
    submission_status?: string | null;
    admin_approval_status?: string | null;
    created_at?: string | null;
};

type MechaturaMemberExport = {
    id: string;
    team_id: string;
    user_id?: string | null;
    full_name?: string | null;
    phone_number?: string | null;
    email?: string;
    institution?: string | null;
    city?: string | null;
    instagram_username?: string | null;
    is_leader?: boolean;
};

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

const formatPaymentStatus = (status: string | null | undefined) =>
    status && status in paymentStatusLabels
        ? paymentStatusLabels[status as keyof typeof paymentStatusLabels]
        : paymentStatusLabels.unpaid;

const formatCompetition = (value: unknown) => {
    if (value === "robot_sumo") return mechaturaCompetitionLabels["sumo"];
    if (value === "robot_transporter") return mechaturaCompetitionLabels["transporter"];
    return String(value ?? "");
}

const chunk = <T,>(items: T[], size: number) => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }
    return chunks;
};

export async function GET(request: NextRequest) {
    try {
        const { user, adminAccess } = await requireAdmin();
        if (!user || !adminAccess) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

    const limit = await rateLimit(user.id, {
        key: "admin-export-mechatura",
        limit: 15,
        windowSeconds: 60,
    });
    if (!limit.success) {
        return rateLimited(limit.retryAfter);
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get("category") ?? undefined;
    const paymentParam = searchParams.get("payment") ?? undefined;
    const searchParam = searchParams.get("search") ?? undefined;
    const submissionParam = searchParams.get("submission") ?? undefined;
    const approvalParam = searchParams.get("approval") ?? undefined;
    const batchParam = searchParams.get("batch") ?? undefined;

    const categoryFilter = normalizeFilter(categoryParam, categoryFilters, "all");
    const paymentFilter = normalizeFilter(paymentParam, paymentFilters, "all");
    const submissionFilter = normalizeFilter(submissionParam, submissionFilters, "all");
    const approvalFilter = normalizeFilter(approvalParam, approvalFilters, "all");
    const batchFilter = normalizeFilter(batchParam, batchFilters, "all");
    const searchPattern = toSearchPattern(searchParam ?? "");

    const supabase = await createClient();

    // First fetch members that match search pattern (no artificial limit for exports)
    const { data: memberSearchMatches } = searchPattern
        ? await supabase
            .from("mechatura_members")
            .select("team_id")
            .or(`full_name.ilike.${searchPattern},phone_number.ilike.${searchPattern}`)
            .returns<Array<{ team_id: string }>>()
        : { data: [] };

    // Limit matched member team IDs to prevent PostgREST 414 URI Too Long errors
    const memberTeamIds = Array.from(new Set((memberSearchMatches ?? []).map((m) => m.team_id))).slice(0, 100);
    const filterOptions = {
        categoryFilter,
        paymentFilter,
        submissionFilter,
        approvalFilter,
        batchFilter,
        searchPattern,
        memberRegistrationIds: memberTeamIds,
    };

    const buildQuery = () => applyMechaturaFilters(
        supabase.from("mechatura_teams").select("*"),
        filterOptions
    );

    const registrations: MechaturaTeamExport[] = [];
    const batchSize = 1000;
    let offset = 0;

    while (true) {
        const { data, error } = await buildQuery()
            .order("created_at", { ascending: false })
            .order("name", { ascending: true })
            .range(offset, offset + batchSize - 1);

        if (error) {
            return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
        }
        registrations.push(...(data ?? []));
        if (!data || data.length < batchSize) break;
        offset += batchSize;
    }

    if (registrations.length === 0) {
        return new NextResponse("Tidak ada data untuk diekspor", { status: 404 });
    }

    const members: MechaturaMemberExport[] = [];
    const teamIds = registrations.map((r) => r.id);
    const memberChunkSize = 150;

    for (const ids of chunk(teamIds, memberChunkSize)) {
        const { data, error } = await supabase
            .from("mechatura_members")
            .select("*")
            .in("team_id", ids)
            .order("is_leader", { ascending: false })
            .order("full_name", { ascending: true });

        if (error) {
            return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
        }
        members.push(...(data ?? []));
    }

    const validMechaturaCols = new Set([
        "id", "join_code", "name", "category", "pembina_name", "pembina_phone",
        "leader_name", "leader_phone", "leader_email", "leader_institution", "leader_city", "leader_instagram",
        "payment_status", "submission_status", "approval_status", "created_at",
        "member_name", "member_phone", "member_email", "member_institution", "member_city", "member_instagram"
    ]);
    const colsParam = searchParams.get("cols");
    const rawRequestedCols = colsParam ? colsParam.split(",").map(c => c.trim()).filter(Boolean) : [];
    const validRequestedCols = rawRequestedCols.filter(col => validMechaturaCols.has(col));
    const requestedCols = validRequestedCols.length > 0 ? validRequestedCols : [];
    const shouldExport = (col: string) => requestedCols.length === 0 || requestedCols.includes(col);

    // Attempt to fetch emails and fallback names for members only when requested
    const needsEmailOrName = shouldExport("leader_email") || shouldExport("member_email") || 
                             shouldExport("leader_name") || shouldExport("member_name");

    const uniqueUserIds = needsEmailOrName
        ? Array.from(new Set(members.map(m => m.user_id).filter((id): id is string => Boolean(id))))
        : [];
    const emailsByUserId = new Map<string, string>();
    const namesByUserId = new Map<string, string>();

    if (needsEmailOrName && uniqueUserIds.length > 0) {
        const adminSupabase = createAdminClient();
        const neededSet = new Set(uniqueUserIds);

        if (uniqueUserIds.length <= 5) {
            // For small batches, query directly in parallel
            await Promise.all(
                uniqueUserIds.map(async (userId) => {
                    try {
                        const { data } = await adminSupabase.auth.admin.getUserById(userId);
                        if (data?.user) {
                            if (data.user.email) emailsByUserId.set(userId, data.user.email);
                            const meta = data.user.user_metadata || {};
                            const name = meta.display_name?.trim() || 
                                         meta.username?.trim() || 
                                         data.user.email?.trim() || 
                                         meta.full_name?.trim() || 
                                         meta.name?.trim() || 
                                         "";
                            if (name) namesByUserId.set(userId, name);
                        }
                    } catch {
                        // ignore
                    }
                })
            );
        } else {
            // Paginated scan with early exit when all needed IDs are found
            let page = 1;
            let hasNextPage = true;
            while (hasNextPage && emailsByUserId.size < neededSet.size && page <= 10) {
                const { data, error } = await adminSupabase.auth.admin.listUsers({ page, perPage: 1000 });
                if (error || !data?.users?.length) break;
                for (const u of data.users) {
                    if (neededSet.has(u.id)) {
                        if (u.email) emailsByUserId.set(u.id, u.email);
                        const meta = u.user_metadata || {};
                        const name = meta.display_name?.trim() || 
                                     meta.username?.trim() || 
                                     u.email?.trim() || 
                                     meta.full_name?.trim() || 
                                     meta.name?.trim() || 
                                     "";
                        if (name) namesByUserId.set(u.id, name);
                    }
                }
                hasNextPage = data.users.length === 1000;
                page++;
            }
        }
    }

    const membersByTeamId = new Map<string, MechaturaMemberExport[]>();
    for (const member of members) {
        member.email = member.user_id ? (emailsByUserId.get(member.user_id) || "") : "";
        const teamMembers = membersByTeamId.get(member.team_id) ?? [];
        teamMembers.push(member);
        membersByTeamId.set(member.team_id, teamMembers);
    }

    const headers: string[] = [];
    if (shouldExport("id")) headers.push("ID");
    if (shouldExport("join_code")) headers.push("Kode Unik");
    if (shouldExport("name")) headers.push("Nama Tim");
    if (shouldExport("category")) headers.push("Kategori");
    if (shouldExport("pembina_name")) headers.push("Nama Pembina");
    if (shouldExport("pembina_phone")) headers.push("No. WA Pembina");
    if (shouldExport("leader_name")) headers.push("Nama Ketua");
    if (shouldExport("leader_phone")) headers.push("No. WA Ketua");
    if (shouldExport("leader_email")) headers.push("Email Ketua");
    if (shouldExport("leader_institution")) headers.push("Instansi Ketua");
    if (shouldExport("leader_city")) headers.push("Kota Ketua");
    if (shouldExport("leader_instagram")) headers.push("Instagram Ketua");
    if (shouldExport("payment_status")) headers.push("Status Pembayaran");
    if (shouldExport("submission_status")) headers.push("Status Pengumpulan");
    if (shouldExport("approval_status")) headers.push("Verifikasi Admin");
    if (shouldExport("created_at")) headers.push("Waktu Daftar");

    let maxMembers = 0;
    const teamsWithMembers = registrations.map((team) => {
        const teamMembers = membersByTeamId.get(team.id) ?? [];
        const leader = teamMembers.find((m) => m.is_leader) || teamMembers[0];
        const membersOnly = teamMembers.filter((m) => m.id !== leader?.id);
        if (membersOnly.length > maxMembers) maxMembers = membersOnly.length;
        return { team, leader, membersOnly };
    });

    for (let i = 0; i < maxMembers; i++) {
        if (shouldExport("member_name")) headers.push(`Nama Anggota ${i + 1}`);
        if (shouldExport("member_phone")) headers.push(`No. WA Anggota ${i + 1}`);
        if (shouldExport("member_email")) headers.push(`Email Anggota ${i + 1}`);
        if (shouldExport("member_institution")) headers.push(`Instansi Anggota ${i + 1}`);
        if (shouldExport("member_city")) headers.push(`Kota Anggota ${i + 1}`);
        if (shouldExport("member_instagram")) headers.push(`Instagram Anggota ${i + 1}`);
    }

    const rows = teamsWithMembers.map(({ team, leader, membersOnly }) => {
        let date = "";
        if (team.created_at) {
            const d = new Date(team.created_at);
            date = new Intl.DateTimeFormat("id-ID", {
                timeZone: "Asia/Jakarta",
                year: "numeric", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit",
                hour12: false
            }).format(d).replace(/\./g, ":").replace(",", "");
        }

        const baseRow: string[] = [];
        if (shouldExport("id")) baseRow.push(escapeCSV(team.id));
        if (shouldExport("join_code")) baseRow.push(escapeCSV(team.join_code));
        if (shouldExport("name")) baseRow.push(escapeCSV(team.name));
        if (shouldExport("category")) baseRow.push(escapeCSV(formatCompetition(team.category)));
        if (shouldExport("pembina_name")) baseRow.push(escapeCSV(team.pembina_name));
        if (shouldExport("pembina_phone")) baseRow.push(escapeCSV(team.pembina_phone));
        if (shouldExport("leader_name")) baseRow.push(escapeCSV(leader?.full_name?.trim() || (leader?.user_id ? namesByUserId.get(leader.user_id) : "") || ""));
        if (shouldExport("leader_phone")) baseRow.push(escapeCSV(leader?.phone_number));
        if (shouldExport("leader_email")) baseRow.push(escapeCSV(leader?.email));
        if (shouldExport("leader_institution")) baseRow.push(escapeCSV(leader?.institution));
        if (shouldExport("leader_city")) baseRow.push(escapeCSV(leader?.city));
        if (shouldExport("leader_instagram")) baseRow.push(escapeCSV(leader?.instagram_username));
        if (shouldExport("payment_status")) baseRow.push(escapeCSV(formatPaymentStatus(team.payment_status)));
        if (shouldExport("submission_status")) baseRow.push(escapeCSV(team.submission_status));
        if (shouldExport("approval_status")) baseRow.push(escapeCSV(team.admin_approval_status));
        if (shouldExport("created_at")) baseRow.push(escapeCSV(date));

        const memberCols: string[] = [];
        for (let i = 0; i < maxMembers; i++) {
            const m = membersOnly[i];
            if (shouldExport("member_name")) memberCols.push(escapeCSV(m?.full_name?.trim() || (m?.user_id ? namesByUserId.get(m.user_id) : "") || ""));
            if (shouldExport("member_phone")) memberCols.push(escapeCSV(m?.phone_number));
            if (shouldExport("member_email")) memberCols.push(escapeCSV(m?.email));
            if (shouldExport("member_institution")) memberCols.push(escapeCSV(m?.institution));
            if (shouldExport("member_city")) memberCols.push(escapeCSV(m?.city));
            if (shouldExport("member_instagram")) memberCols.push(escapeCSV(m?.instagram_username));
        }

        return [...baseRow, ...memberCols].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

        return new NextResponse("\uFEFF" + csvContent, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="mechatura-teams-${new Date().toISOString().split("T")[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Export Mechatura error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat mengekspor data" },
            { status: 500 }
        );
    }
}