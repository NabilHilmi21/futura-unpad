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
import { ChevronDown, ChevronLeft, ChevronRight, Download, Search, X, School, BookOpen, GraduationCap, Layers, Cpu, Leaf, Lightbulb } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { DataTable } from "./data-table";
import { getColumns } from "./participants";
import { ExportCsvDialog, type ActiveFilterBadge } from "@/components/admin/export-csv-dialog";
import {
    buildEsaiPageHref,
    pageSizeOptions,
    submissionFilters,
    type EsaiSubmissionFilter,
    type EsaiCategoryFilter,
    type EsaiSubthemeFilter,
    AdminEsaiRegistration
} from "./_lib/esai-utils";

type EsaiListClientProps = {
    registrations: AdminEsaiRegistration[];
    searchParam?: string;
    submissionFilter: EsaiSubmissionFilter;
    categoryFilter: EsaiCategoryFilter;
    subthemeFilter: EsaiSubthemeFilter;
    pageSize: number;
    pagination: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
        startItem: number;
        endItem: number;
    };
    stats: { totalParticipants: number; approvedDocuments: number; submittedDocuments: number; };
};

const COLUMN_LABELS: Record<string, string> = {
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
};

const COLUMN_GROUPS = [
    {
        title: "Identitas Peserta",
        keys: ["id", "user_id", "full_name", "institution", "institution_category", "city", "created_at"]
    },
    {
        title: "Kontak",
        keys: ["email", "phone_number"]
    },
    {
        title: "Karya Esai",
        keys: ["paper_title", "sub_theme"]
    },
    {
        title: "Status Pendaftaran",
        keys: ["submission_status"]
    },
    {
        title: "Dokumen Lampiran",
        keys: ["essay_paper_url", "identity_card_url", "instagram_twibbon_url"]
    }
];

const categoryOptions = [
    { value: "all", label: "Semua Jenjang", icon: School },
    { value: "SMA", label: "SMA", icon: BookOpen },
    { value: "SMK", label: "SMK", icon: GraduationCap },
    { value: "perguruan_tinggi", label: "Perguruan Tinggi", icon: GraduationCap },
] as const;

const subthemeOptions = [
    { value: "all", label: "Semua Subtema", icon: Layers },
    { value: "digital", label: "Transformasi Digital", icon: Cpu },
    { value: "hijau", label: "Industri Hijau", icon: Leaf },
    { value: "talenta", label: "Talenta & Ekosistem", icon: Lightbulb },
] as const;

const ESSENTIAL_ESAI_COLS = [
    "id",
    "full_name",
    "institution",
    "institution_category",
    "city",
    "email",
    "phone_number",
    "paper_title",
    "sub_theme",
    "submission_status",
];

export default function EsaiListClient({
    registrations,
    searchParam,
    submissionFilter,
    categoryFilter,
    subthemeFilter,
    pageSize,
    pagination,
    stats,
}: EsaiListClientProps) {
    const router = useRouter();
    const hasActiveFilters =
        !!searchParam?.trim() || submissionFilter !== "all" || categoryFilter !== "all" || subthemeFilter !== "all";

    const [exportOpen, setExportOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        submission: submissionFilter,
        category: categoryFilter,
        subtheme: subthemeFilter,
    });

    const exportFilterBadges = useMemo<ActiveFilterBadge[]>(() => {
        const badges: ActiveFilterBadge[] = [];
        if (searchParam?.trim()) {
            badges.push({ key: "search", label: "Pencarian", value: `"${searchParam.trim()}"` });
        }
        if (localFilters.submission !== "all") {
            const label = localFilters.submission === "draft" ? "Draft" : 
                          localFilters.submission === "submitted" ? "Submitted" : 
                          localFilters.submission === "approved" ? "Disetujui" : localFilters.submission;
            badges.push({ key: "submission", label: "Status Dokumen", value: label });
        }
        if (localFilters.category !== "all") {
            const cat = categoryOptions.find(c => c.value === localFilters.category);
            badges.push({ key: "category", label: "Jenjang", value: cat?.label ?? localFilters.category });
        }
        if (localFilters.subtheme !== "all") {
            const st = subthemeOptions.find(s => s.value === localFilters.subtheme);
            badges.push({ key: "subtheme", label: "Subtema", value: st?.label ?? localFilters.subtheme });
        }
        return badges;
    }, [searchParam, localFilters]);

    const buildExportParams = useCallback((mode: "all" | "filtered") => {
        if (mode === "all") {
            return {};
        }
        return {
            search: searchParam?.trim(),
            submission: localFilters.submission,
            category: localFilters.category,
            subtheme: localFilters.subtheme,
        };
    }, [searchParam, localFilters]);

    const esaiFilterControls = useMemo(() => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5">
                <Label htmlFor="filter-esai-submission" className="text-xs sm:text-sm font-medium text-foreground">
                    Status Dokumen
                </Label>
                <Select
                    value={localFilters.submission}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, submission: val as EsaiSubmissionFilter }))}
                >
                    <SelectTrigger id="filter-esai-submission" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {submissionFilters.map((status) => (
                            <SelectItem key={status} value={status} className="text-sm">
                                {status === "all" ? "Semua Status" : 
                                 status === "draft" ? "Draft" : 
                                 status === "submitted" ? "Submitted" : "Disetujui"}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="filter-esai-category" className="text-xs sm:text-sm font-medium text-foreground">
                    Jenjang
                </Label>
                <Select
                    value={localFilters.category}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, category: val as EsaiCategoryFilter }))}
                >
                    <SelectTrigger id="filter-esai-category" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih jenjang" />
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
                <Label htmlFor="filter-esai-subtheme" className="text-xs sm:text-sm font-medium text-foreground">
                    Subtema
                </Label>
                <Select
                    value={localFilters.subtheme}
                    onValueChange={(val) => setLocalFilters((f) => ({ ...f, subtheme: val as EsaiSubthemeFilter }))}
                >
                    <SelectTrigger id="filter-esai-subtheme" size="sm" className="w-full bg-background border-border text-sm text-foreground h-9">
                        <SelectValue placeholder="Pilih subtema" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="bg-popover border-border text-popover-foreground z-[70]">
                        {subthemeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    ), [localFilters]);

    const metrics = [
        { label: "Total Peserta", value: stats.totalParticipants },
        { label: "Dokumen Disetujui", value: stats.approvedDocuments },
        { label: "Pendaftaran Disubmit", value: stats.submittedDocuments },
    ];
    
    const buildPageHref = (page: number, nextPageSize = pageSize) =>
        buildEsaiPageHref({
            page,
            pageSize: nextPageSize,
            search: searchParam,
            submission: submissionFilter,
            category: categoryFilter,
            subtheme: subthemeFilter,
        });

    const updateFilter = (key: string, value: string | undefined) => {
        const newHref = buildEsaiPageHref({
            page: 1, // reset to page 1 on filter change
            pageSize: key === "pageSize" ? Number(value) : pageSize,
            search: key === "search" ? value : searchParam,
            submission: key === "submission" ? (value as EsaiSubmissionFilter) : submissionFilter,
            category: key === "category" ? (value as EsaiCategoryFilter) : categoryFilter,
            subtheme: key === "subtheme" ? (value as EsaiSubthemeFilter) : subthemeFilter,
        });
        router.push(newHref);
    };

    const activeFilterPills: Array<{ key: string; label: string; onRemove: () => void }> = [];
    if (searchParam?.trim()) {
        activeFilterPills.push({
            key: "search",
            label: `Search: "${searchParam.trim()}"`,
            onRemove: () => updateFilter("search", undefined)
        });
    }
    if (submissionFilter !== "all") {
        const label = submissionFilter === "draft" ? "Draft" : 
                      submissionFilter === "submitted" ? "Submitted" : 
                      submissionFilter === "approved" ? "Disetujui" :
                      (submissionFilter as string).charAt(0).toUpperCase() + (submissionFilter as string).slice(1);
        activeFilterPills.push({
            key: "submission",
            label: `Status: ${label}`,
            onRemove: () => updateFilter("submission", "all")
        });
    }
    if (categoryFilter !== "all") {
        const cat = categoryOptions.find(c => c.value === categoryFilter);
        activeFilterPills.push({
            key: "category",
            label: `Jenjang: ${cat?.label ?? categoryFilter}`,
            onRemove: () => updateFilter("category", "all")
        });
    }
    if (subthemeFilter !== "all") {
        const st = subthemeOptions.find(s => s.value === subthemeFilter);
        activeFilterPills.push({
            key: "subtheme",
            label: `Subtema: ${st?.label ?? subthemeFilter}`,
            onRemove: () => updateFilter("subtheme", "all")
        });
    }

    const participantData = registrations;

    const columns = useMemo(() => getColumns(searchParam), [searchParam]);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateFilter("search", formData.get("search") as string);
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 min-w-0">
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            Lomba Esai
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setLocalFilters({
                                    submission: submissionFilter,
                                    category: categoryFilter,
                                    subtheme: subthemeFilter,
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
                            title="Ekspor Data Lomba Esai"
                            description="Pilih data peserta dan kolom yang ingin diekspor."
                            entityName="Peserta"
                            totalCount={stats.totalParticipants}
                            hasActiveFilters={hasActiveFilters}
                            activeFilterBadges={exportFilterBadges}
                            columnLabels={COLUMN_LABELS}
                            columnGroups={COLUMN_GROUPS}
                            essentialColumns={ESSENTIAL_ESAI_COLS}
                            exportEndpoint="/api/admin/esai-registrations/export"
                            filenamePrefix="data-peserta-esai"
                            buildExportParams={buildExportParams}
                            filterControlContent={esaiFilterControls}
                        />
                </div>
            </div>

            {/* Resend-style Pill Tabs for Jenjang */}
            <div
                role="tablist"
                aria-label="Jenjang Peserta"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-zinc-800/60">
                {metrics.map((metric, idx) => (
                    <div key={metric.label} className={`min-w-0 ${idx === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
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
                        placeholder="Search nama peserta, email, atau institusi..."
                        className="h-10 w-full rounded-xl border border-zinc-800/80 bg-zinc-950/80 px-3 pl-9 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                    />
                    <button type="submit" className="sr-only">Cari</button>
                </div>

                {/* Filter Dropdowns Grid: 2 columns on mobile/tablet, flex row on desktop */}
                <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:w-auto lg:items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {submissionFilter === "all" ? "Semua Status" : 
                                     submissionFilter === "draft" ? "Draft" : 
                                     submissionFilter === "submitted" ? "Submitted" : "Disetujui"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[160px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {submissionFilters.map((status) => (
                                <DropdownMenuItem key={status} onSelect={() => updateFilter("submission", status)}>
                                    {status === "all" ? "Semua Status" : 
                                     status === "draft" ? "Draft" : 
                                     status === "submitted" ? "Submitted" : "Disetujui"}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button type="button" variant="outline" className="w-full lg:w-auto h-10 px-3 rounded-xl bg-zinc-950/80 border-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-900/60 text-xs sm:text-sm font-medium flex items-center justify-between gap-1.5 transition-colors shrink-0">
                                <span className="truncate">
                                    {subthemeOptions.find(o => o.value === subthemeFilter)?.label || "Semua Subtema"}
                                </span>
                                <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0 ml-1.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[200px] bg-zinc-900 border-zinc-800 text-zinc-200">
                            {subthemeOptions.map((option) => (
                                <DropdownMenuItem key={option.value} onSelect={() => updateFilter("subtheme", option.value)}>
                                    {option.label}
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
                        onClick={() => router.push(buildEsaiPageHref({ page: 1, pageSize, search: undefined, submission: "all", category: "all", subtheme: "all" }))}
                        className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 ml-2 transition-colors"
                    >
                        Hapus semua
                    </button>
                </div>
            )}

            <DataTable columns={columns} data={participantData} />

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
