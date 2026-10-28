"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExportCsvDialog, type ActiveFilterBadge } from "@/components/admin/export-csv-dialog";
import { mechaturaCompetitionLabels } from "@/lib/payment";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, LayoutGrid, Swords, Truck } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { getColumns, type AdminMechaturaTeam } from "./teams";
import {
    buildMechaturaPageHref,
    pageSizeOptions,
    submissionFilters,
    approvalFilters,
    batchFilters,
    type MechaturaCategoryFilter,
    type MechaturaPaymentFilter,
    type MechaturaSubmissionFilter,
    type MechaturaApprovalFilter,
    type MechaturaBatchFilter,
} from "./_lib/mechatura-utils";

type MechaturaListClientProps = {
    registrations: AdminMechaturaTeam[];
    searchParam?: string;
    categoryFilter: MechaturaCategoryFilter;
    paymentFilter: MechaturaPaymentFilter;
    submissionFilter: MechaturaSubmissionFilter;
    approvalFilter: MechaturaApprovalFilter;
    batchFilter: MechaturaBatchFilter;
    pageSize: number;
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        startItem: number;
        endItem: number;
    };
    stats: {
        totalTeams: number;
        paidTeams: number;
        sumoTeams: number;
        transporterTeams: number;
    };
};

const categoryOptions = [
    { value: "all", label: "Semua Kategori", icon: LayoutGrid },
    { value: "sumo", label: mechaturaCompetitionLabels.sumo, icon: Swords },
    { value: "transporter", label: mechaturaCompetitionLabels.transporter, icon: Truck },
];

const COLUMN_LABELS: Record<string, string> = {
    id: "ID",
    join_code: "Kode Unik",
    name: "Nama Tim",
    category: "Kategori",
    created_at: "Waktu Daftar",
    submission_status: "Status Pengumpulan",
    approval_status: "Verifikasi Admin",
    pembina_name: "Nama Pembina",
    pembina_phone: "No. WA Pembina",
    leader_name: "Nama Ketua",
    leader_phone: "No. WA Ketua",
    leader_email: "Email Ketua",
    leader_institution: "Instansi Ketua",
    leader_city: "Kota Ketua",
    leader_instagram: "Instagram Ketua",
    member_name: "Nama Anggota",
    member_phone: "No. WA Anggota",
    member_email: "Email Anggota",
    member_institution: "Instansi Anggota",
    member_city: "Kota Anggota",
    member_instagram: "Instagram Anggota",
};

const COLUMN_GROUPS = [
    {
        title: "Identitas Tim",
        keys: ["id", "join_code", "name", "category", "created_at"]
    },
    {
        title: "Status",
        keys: ["submission_status", "approval_status"]
    },
    {
        title: "Pembina",
        keys: ["pembina_name", "pembina_phone"]
    },
    {
        title: "Ketua",
        keys: ["leader_name", "leader_phone", "leader_email", "leader_institution", "leader_city", "leader_instagram"]
    },
    {
        title: "Anggota",
        keys: ["member_name", "member_phone", "member_email", "member_institution", "member_city", "member_instagram"]
    }
];

const ESSENTIAL_MECHATURA_COLS = [
    "id",
    "join_code",
    "name",
    "category",
    "submission_status",
    "approval_status",
    "leader_name",
    "leader_phone",
    "leader_email",
    "leader_institution",
];

export default function MechaturaListClient({
    registrations,
    searchParam,
    categoryFilter,
    paymentFilter,
    submissionFilter,
    approvalFilter,
    batchFilter,
    pageSize,
    pagination,
    stats,
}: MechaturaListClientProps) {
    const router = useRouter();
    const hasActiveExportFilters =
        !!searchParam?.trim() || categoryFilter !== "all" || submissionFilter !== "all" || approvalFilter !== "all" || batchFilter !== "all";

    const [exportOpen, setExportOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        category: categoryFilter,
        submission: submissionFilter,
        approval: approvalFilter,
        batch: batchFilter,
    });

    const exportFilterBadges = useMemo<ActiveFilterBadge[]>(() => {
        const badges: ActiveFilterBadge[] = [];
        if (searchParam?.trim()) {
            badges.push({ key: "search", label: "Pencarian", value: `"${searchParam.trim()}"` });
        }
        if (localFilters.category !== "all") {
            const cat = categoryOptions.find(o => o.value === localFilters.category)?.label || localFilters.category;
            badges.push({ key: "category", label: "Kategori", value: cat });
        }
        if (localFilters.submission !== "all") {
            const sub = localFilters.submission === "draft" ? "Draft" : "Submitted";
            badges.push({ key: "submission", label: "Pengumpulan", value: sub });
        }
        if (localFilters.approval !== "all") {
            const app = localFilters.approval === "pending" ? "Menunggu" : localFilters.approval === "approved" ? "Disetujui" : "Revisi";
            badges.push({ key: "approval", label: "Verifikasi", value: app });
        }
        if (localFilters.batch !== "all") {
            badges.push({ key: "batch", label: "Batch", value: localFilters.batch === "batch1" ? "Batch 1" : "Batch 2" });
        }
        return badges;
    }, [searchParam, localFilters]);

    const buildExportParams = useCallback((mode: "all" | "filtered") => {
        if (mode === "all") {
            return {};
        }
        return {
            search: searchParam?.trim(),
            category: localFilters.category,
            submission: localFilters.submission,
            approval: localFilters.approval,
            batch: localFilters.batch,
        };
    }, [searchParam, localFilters]);

    const mechaturaFilterControls = useMemo(() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="space-y-1.5">
                <Label htmlFor="filter-mechatura-category" className="text-xs sm:text-sm font-medium text-foreground">
                    Kategori
                </Label>
                <Select
                    value={localFilters.category}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, category: val as MechaturaCategoryFilter }))}
                >
                    <SelectTrigger id="filter-mechatura-category" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="filter-mechatura-submission" className="text-xs sm:text-sm font-medium text-foreground">
                    Pengumpulan
                </Label>
                <Select
                    value={localFilters.submission}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, submission: val as MechaturaSubmissionFilter }))}
                >
                    <SelectTrigger id="filter-mechatura-submission" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {submissionFilters.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">
                                {s === "all" ? "Semua Submit" : s === "draft" ? "Draft" : "Submitted"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="filter-mechatura-approval" className="text-xs sm:text-sm font-medium text-foreground">
                    Verifikasi
                </Label>
                <Select
                    value={localFilters.approval}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, approval: val as MechaturaApprovalFilter }))}
                >
                    <SelectTrigger id="filter-mechatura-approval" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih verifikasi" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {approvalFilters.map((a) => (
                            <SelectItem key={a} value={a} className="text-sm">
                                {a === "all" ? "Semua Approval" : a === "pending" ? "Menunggu" : a === "approved" ? "Disetujui" : "Revisi"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="filter-mechatura-batch" className="text-xs sm:text-sm font-medium text-foreground">
                    Batch
                </Label>
                <Select
                    value={localFilters.batch}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, batch: val as MechaturaBatchFilter }))}
                >
                    <SelectTrigger id="filter-mechatura-batch" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih batch" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {batchFilters.map((b) => (
                            <SelectItem key={b} value={b} className="text-sm">
                                {b === "all" ? "Semua Batch" : b === "batch1" ? "Batch 1" : "Batch 2"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    ), [localFilters]);

    const metrics = [
        { label: "Total tim", value: stats.totalTeams },
        { label: "Tim Disetujui", value: stats.paidTeams },
        { label: "Robot Sumo", value: stats.sumoTeams },
        { label: "Robot Transporter", value: stats.transporterTeams },
    ];
    const buildPageHref = (page: number, nextPageSize = pageSize) =>
        buildMechaturaPageHref({
            page,
            pageSize: nextPageSize,
            search: searchParam,
            category: categoryFilter,
            payment: paymentFilter,
            submission: submissionFilter,
            approval: approvalFilter,
            batch: batchFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildMechaturaPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            category: key === "category" ? (value as MechaturaCategoryFilter) : categoryFilter,
            payment: key === "payment" ? (value as MechaturaPaymentFilter) : paymentFilter,
            submission: key === "submission" ? (value as MechaturaSubmissionFilter) : submissionFilter,
            approval: key === "approval" ? (value as MechaturaApprovalFilter) : approvalFilter,
            batch: key === "batch" ? (value as MechaturaBatchFilter) : batchFilter,
        });
        router.push(newHref);
    };

    const activeFilterPills = [];
    if (searchParam?.trim()) {
        activeFilterPills.push({
            key: "search",
            label: `Search: "${searchParam}"`,
            onRemove: () => updateFilter("search", undefined)
        });
    }
    if (categoryFilter !== "all") {
        const label = categoryOptions.find(o => o.value === categoryFilter)?.label;
        activeFilterPills.push({
            key: "category",
            label: `Category: ${label}`,
            onRemove: () => updateFilter("category", "all")
        });
    }
    if (submissionFilter !== "all") {
        const label = submissionFilter === "draft" ? "Draft" : 
                      submissionFilter === "submitted" ? "Submitted" : 
                      (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1);
        activeFilterPills.push({
            key: "submission",
            label: `Submission: ${label}`,
            onRemove: () => updateFilter("submission", "all")
        });
    }
    if (approvalFilter !== "all") {
        const label = approvalFilter === "pending" ? "Menunggu" : 
                      approvalFilter === "approved" ? "Disetujui" :
                      approvalFilter === "revision" ? "Revisi" :
                      (approvalFilter as string).charAt(0).toUpperCase() + (approvalFilter as string).slice(1);
        activeFilterPills.push({
            key: "approval",
            label: `Approval: ${label}`,
            onRemove: () => updateFilter("approval", "all")
        });
    }
    if (batchFilter !== "all") {
        const label = batchFilter === "batch1" ? "Batch 1" : "Batch 2";
        activeFilterPills.push({
            key: "batch",
            label: `Batch: ${label}`,
            onRemove: () => updateFilter("batch", "all")
        });
    }

    const teamData = registrations;
    const columns = useMemo(() => getColumns(searchParam), [searchParam]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("search", formData.get("search") as string);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0">
            {/* Header row */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Mechatura
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLocalFilters({
                                    category: categoryFilter,
                                    submission: submissionFilter,
                                    approval: approvalFilter,
                                    batch: batchFilter,
                                });
                                setExportOpen(true);
                            }}
                            className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs sm:text-sm font-medium transition-colors shrink-0"
                        >
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                            Ekspor CSV
                        </Button>

                        <ExportCsvDialog
                            open={exportOpen}
                            onOpenChange={setExportOpen}
                            title="Ekspor Data Tim Mechatura"
                            description="Pilih data tim dan kolom yang ingin diekspor."
                            entityName="Tim"
                            totalCount={stats.totalTeams}
                            hasActiveFilters={hasActiveExportFilters}
                            activeFilterBadges={exportFilterBadges}
                            columnLabels={COLUMN_LABELS}
                            columnGroups={COLUMN_GROUPS}
                            essentialColumns={ESSENTIAL_MECHATURA_COLS}
                            exportEndpoint="/api/admin/mechatura-registrations/export"
                            filenamePrefix="mechatura-teams"
                            buildExportParams={buildExportParams}
                            filterControlContent={mechaturaFilterControls}
                        />
                </div>
            </div>

            {/* Resend-style Pill Tabs for Category */}
            <div
                role="tablist"
                aria-label="Kategori Lomba"
                className="flex items-center gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {categoryOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        role="tab"
                        aria-selected={categoryFilter === option.value}
                        onClick={() => updateFilter("category", option.value)}
                        className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap ${
                            categoryFilter === option.value
                                ? "bg-zinc-800 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Metrics strip - matching Resend mobile layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 border-y border-zinc-800/60">
                {metrics.map((metric) => (
                    <div key={metric.label} className="min-w-0">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400 truncate">
                                {metric.label}
                            </span>
                            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                                {metric.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Resend-style Filter Bar */}
            <form onSubmit={onSubmit} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 sm:gap-2.5 min-w-0 max-w-full">
                <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <input
                        key={searchParam ?? "empty"}
                        name="search"
                        defaultValue={searchParam ?? ""}
                        placeholder="Search tim, institusi, atau nama anggota..."
                        className="h-10 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                    />
                    <button type="submit" className="sr-only">Cari</button>
                </div>

                {/* Filter Dropdowns Grid: 2 columns on mobile, 3 on tablet, flex row on desktop */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full lg:flex lg:w-auto lg:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {batchFilter === "all" ? "Semua Batch" : batchFilter === "batch1" ? "Batch 1" : "Batch 2"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {batchFilters.map((status) => (
                                <DropdownMenuItem key={status} onSelect={() => updateFilter("batch", status)}>
                                    {status === "all" ? "Semua Batch" : status === "batch1" ? "Batch 1" : "Batch 2"}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {submissionFilter === "all" ? "Semua Submit" : submissionFilter === "draft" ? "Draft" : "Submitted"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {submissionFilters.map((status) => (
                                <DropdownMenuItem key={status} onSelect={() => updateFilter("submission", status)}>
                                    {status === "all" ? "Semua Submit" : status === "draft" ? "Draft" : "Submitted"}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="col-span-2 sm:col-span-1 w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {approvalFilter === "all" ? "Semua Verifikasi" : approvalFilter === "pending" ? "Menunggu" : approvalFilter === "approved" ? "Disetujui" : "Revisi"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {approvalFilters.map((status) => (
                                <DropdownMenuItem key={status} onSelect={() => updateFilter("approval", status)}>
                                    {status === "all" ? "Semua Verifikasi" : status === "pending" ? "Menunggu" : status === "approved" ? "Disetujui" : "Revisi"}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                </div>

            </form>

            {activeFilterPills.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-zinc-500 font-medium">Filter aktif:</span>
                    {activeFilterPills.map(pill => (
                        <div key={pill.key} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 px-2.5 py-0.5 text-xs text-zinc-300">
                            {pill.label}
                            <button 
                                onClick={pill.onRemove} 
                                className="rounded-full p-0.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 transition-colors" 
                                type="button"
                                aria-label="Remove filter"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => router.push(buildMechaturaPageHref({ page: 1, pageSize, search: undefined, category: "all", payment: "all", submission: "all", approval: "all", batch: "all" }))}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
                    >
                        Hapus semua
                    </button>
                </div>
            )}

            <DataTable columns={columns} data={teamData} />

            <div className="flex flex-col gap-3.5 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between sm:justify-start gap-3 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-zinc-300 hidden sm:block">Baris per halaman</p>
                        <p className="font-medium text-zinc-300 sm:hidden">Baris</p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 w-[70px] justify-between px-2 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60">
                                    {pageSize}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-[70px] bg-zinc-900 border-zinc-800 text-zinc-200">
                                {pageSizeOptions.map((option) => (
                                    <DropdownMenuItem key={option} onSelect={() => updateFilter("pageSize", String(option))}>
                                        {option}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="text-xs text-zinc-400 sm:hidden font-medium">
                        {pagination.startItem}-{pagination.endItem} dari {pagination.totalItems}
                    </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 lg:gap-8">
                    <div className="hidden sm:block text-sm text-zinc-400 font-medium">
                        Menampilkan {pagination.startItem}-{pagination.endItem} dari {pagination.totalItems}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full justify-between sm:w-auto">
                        <div className="text-xs sm:text-sm font-medium text-zinc-300">
                            Hal. {pagination.page} / {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
                                disabled={pagination.page <= 1}
                                asChild={pagination.page > 1}
                            >
                                {pagination.page <= 1 ? (
                                    <ChevronLeft className="h-4 w-4" />
                                ) : (
                                    <Link href={buildPageHref(pagination.page - 1)} prefetch={false}>
                                        <span className="sr-only">Go to previous page</span>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="h-8 w-8 p-0 bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60"
                                disabled={pagination.page >= pagination.totalPages}
                                asChild={pagination.page < pagination.totalPages}
                            >
                                {pagination.page >= pagination.totalPages ? (
                                    <ChevronRight className="h-4 w-4" />
                                ) : (
                                    <Link href={buildPageHref(pagination.page + 1)} prefetch={false}>
                                        <span className="sr-only">Go to next page</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
