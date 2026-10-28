"use client";

import * as React from "react";
import { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, X, Loader2, Check, CheckCheck, Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ColumnGroup = {
    title: string;
    keys: string[];
};

export type ActiveFilterBadge = {
    key: string;
    label: string;
    value: string;
};

export type ExportCsvDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    entityName: string;
    totalCount: number;
    hasActiveFilters: boolean;
    activeFilterBadges?: ActiveFilterBadge[];
    columnLabels: Record<string, string>;
    columnGroups: ColumnGroup[];
    defaultColumns?: Record<string, boolean>;
    essentialColumns?: string[];
    exportEndpoint: string;
    buildExportParams: (mode: "all" | "filtered") => Record<string, string | undefined>;
    filenamePrefix?: string;
    filterControlContent?: React.ReactNode;
};

/**
 * Memoized Checkbox item component for performance optimization.
 * Prevents re-rendering all rows when only one column selection changes.
 */
const ColumnCheckboxRow = memo(function ColumnCheckboxRow({
    id,
    name,
    label,
    checked,
    onChange,
}: {
    id: string;
    name: string;
    label: string;
    checked: boolean;
    onChange: (name: string, checked: boolean) => void;
}) {
    const handleChange = useCallback((val: boolean | "indeterminate") => {
        onChange(name, val === true);
    }, [name, onChange]);

    return (
        <Label
            htmlFor={id}
            title={label}
            className={cn(
                "flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-sm cursor-pointer transition-colors select-none min-h-[36px] sm:min-h-[38px] font-normal leading-snug",
                checked
                    ? "text-foreground bg-muted/60 hover:bg-muted/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
            )}
        >
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={handleChange}
                className="size-4 shrink-0 rounded-[4px]"
            />
            <span className="truncate flex-1 font-medium">
                {label}
            </span>
        </Label>
    );
});

export function ExportCsvDialog({
    open,
    onOpenChange,
    title,
    description,
    entityName,
    totalCount,
    hasActiveFilters,
    activeFilterBadges = [],
    columnLabels,
    columnGroups,
    defaultColumns,
    essentialColumns,
    exportEndpoint,
    buildExportParams,
    filenamePrefix = "data-export",
    filterControlContent,
}: ExportCsvDialogProps) {
    const [exportFilterMode, setExportFilterMode] = useState<"all" | "filtered">("all");
    const [searchColumn, setSearchColumn] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);

    // Initial column states memoization with defensive deduplication
    const allKeys = useMemo(
        () => Array.from(new Set(columnGroups.flatMap((g) => g.keys))),
        [columnGroups]
    );
    const allKeysSet = useMemo(() => new Set(allKeys), [allKeys]);

    const initialCols = useMemo(() => {
        if (defaultColumns) return { ...defaultColumns };
        return Object.fromEntries(allKeys.map((k) => [k, true]));
    }, [defaultColumns, allKeys]);

    const [cols, setCols] = useState<Record<string, boolean>>(initialCols);

    // Reset state cleanly when dialog transitions from closed to open
    const wasOpenRef = useRef(open);
    useEffect(() => {
        if (open && !wasOpenRef.current) {
            setExportFilterMode(hasActiveFilters ? "filtered" : "all");
            setCols(initialCols);
            setSearchColumn("");
        }
        wasOpenRef.current = open;
    }, [open, hasActiveFilters, initialCols]);

    // Selected statistics
    const selectedCount = useMemo(() => {
        return allKeys.filter((k) => cols[k]).length;
    }, [allKeys, cols]);

    // Filtered column groups based on search
    const filteredGroups = useMemo(() => {
        const query = searchColumn.trim().toLowerCase();
        if (!query) return columnGroups;

        return columnGroups
            .map((group) => {
                const matchingKeys = group.keys.filter((key) => {
                    const label = (columnLabels[key] || key).toLowerCase();
                    return label.includes(query) || key.toLowerCase().includes(query);
                });
                return {
                    ...group,
                    keys: matchingKeys,
                };
            })
            .filter((group) => group.keys.length > 0);
    }, [columnGroups, columnLabels, searchColumn]);

    const visibleKeys = useMemo(() => {
        return filteredGroups.flatMap((g) => g.keys);
    }, [filteredGroups]);

    const isAllVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((k) => cols[k]);
    const isNoneVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((k) => !cols[k]);

    // Quick selection callbacks
    const selectAllVisible = useCallback(() => {
        setCols((prev) => {
            const next = { ...prev };
            visibleKeys.forEach((k) => {
                next[k] = true;
            });
            return next;
        });
    }, [visibleKeys]);

    const deselectAllVisible = useCallback(() => {
        setCols((prev) => {
            const next = { ...prev };
            visibleKeys.forEach((k) => {
                next[k] = false;
            });
            return next;
        });
    }, [visibleKeys]);

    const selectEssential = useCallback(() => {
        if (!essentialColumns || essentialColumns.length === 0) return;
        const essentialSet = new Set(essentialColumns);
        setCols(Object.fromEntries(allKeys.map((k) => [k, essentialSet.has(k)])));
    }, [allKeys, essentialColumns]);

    const toggleGroup = useCallback((groupKeys: string[]) => {
        setCols((prev) => {
            const allGroupSelected = groupKeys.length > 0 && groupKeys.every((k) => prev[k]);
            const next = { ...prev };
            groupKeys.forEach((k) => {
                next[k] = !allGroupSelected;
            });
            return next;
        });
    }, []);

    const toggleCol = useCallback((key: string, checked: boolean) => {
        setCols((prev) => ({
            ...prev,
            [key]: checked,
        }));
    }, []);

    // Secure async download handler
    const handleDownload = async () => {
        if (selectedCount === 0) {
            toast.error("Pilih minimal satu kolom untuk diekspor");
            return;
        }

        // Security check: validate exportEndpoint protocol and format
        if (
            !exportEndpoint ||
            !exportEndpoint.startsWith("/") ||
            exportEndpoint.startsWith("//") ||
            exportEndpoint.includes("://")
        ) {
            toast.error("Endpoint ekspor tidak valid");
            return;
        }

        setIsDownloading(true);
        const toastId = toast.loading("Menyiapkan data ekspor...");

        try {
            const params = new URLSearchParams();
            const baseParams = buildExportParams(exportFilterMode);

            // Safe parameter sanitization
            for (const [key, val] of Object.entries(baseParams)) {
                if (val !== undefined && val !== null && val !== "" && val !== "all") {
                    // Only permit standard alphanumeric/underscore parameter names
                    if (/^[a-zA-Z0-9_-]+$/.test(key)) {
                        params.set(key, String(val).trim());
                    }
                }
            }

            // Security: Strictly allowlist columns against allKeys definition
            const selectedCols = allKeys.filter((k) => cols[k] && allKeysSet.has(k));
            if (selectedCols.length > 0 && selectedCols.length < allKeys.length) {
                params.set("cols", selectedCols.join(","));
            } else if (selectedCols.length === 0) {
                params.set("cols", allKeys[0] || "id");
            }

            const queryString = params.toString();
            const url = `${exportEndpoint}${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Accept: "text/csv, application/json, text/plain",
                },
            });

            if (!response.ok) {
                toast.dismiss(toastId);
                if (response.status === 401 || response.status === 403) {
                    toast.error("Sesi tidak valid atau Anda tidak memiliki akses admin.");
                    return;
                }
                if (response.status === 404) {
                    toast.error("Tidak ada data yang ditemukan untuk filter yang dipilih.");
                    return;
                }
                if (response.status === 429) {
                    toast.error("Terlalu banyak permintaan ekspor. Mohon tunggu beberapa saat.");
                    return;
                }

                let errorMessage = `Gagal mengunduh CSV (HTTP ${response.status})`;
                try {
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const parsed = await response.json();
                        if (parsed && typeof parsed.error === "string") {
                            errorMessage = parsed.error;
                        } else if (parsed && typeof parsed.message === "string") {
                            errorMessage = parsed.message;
                        }
                    } else {
                        const errText = await response.text();
                        if (errText && errText.trim().length > 0 && errText.length < 150 && !errText.includes("<html")) {
                            errorMessage = errText.trim();
                        }
                    }
                } catch {
                    // Fall back to default error message
                }
                throw new Error(errorMessage);
            }

            const blob = await response.blob();

            // Extract filename from header (supporting standard & UTF-8 RFC 5987)
            let filename = `${filenamePrefix}-${new Date().toISOString().split("T")[0]}.csv`;
            const disposition = response.headers.get("content-disposition");
            if (disposition && disposition.includes("filename")) {
                const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
                const standardMatch = disposition.match(/filename="?([^";]+)"?/i);
                let rawName: string | null = null;
                if (utf8Match) {
                    try {
                        rawName = decodeURIComponent(utf8Match[1]);
                    } catch {
                        rawName = standardMatch ? standardMatch[1] : null;
                    }
                } else if (standardMatch) {
                    rawName = standardMatch[1];
                }

                if (rawName && rawName.trim()) {
                    filename = rawName.trim();
                }
            }

            // Security: Filename sanitization against path traversal, control chars, and enforce .csv
            let cleanName = filename
                .replace(/[/\\]/g, "_")
                .replace(/\.\.+/g, "_")
                .replace(/[\x00-\x1f\x7f]/g, "")
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .replace(/^\.+/, "");

            if (!cleanName || cleanName === ".csv") {
                cleanName = `${filenamePrefix}-${new Date().toISOString().split("T")[0]}.csv`;
            }

            const finalFilename = cleanName.toLowerCase().endsWith(".csv")
                ? cleanName
                : `${cleanName}.csv`;

            // Secure file download execution with guaranteed URL revocation
            const downloadUrl = window.URL.createObjectURL(blob);
            try {
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = downloadUrl;
                a.download = finalFilename;
                a.rel = "noopener noreferrer";
                document.body.appendChild(a);
                a.click();
                a.remove();
            } finally {
                // Revoke object URL safely to prevent memory leak
                setTimeout(() => {
                    window.URL.revokeObjectURL(downloadUrl);
                }, 1000);
            }

            toast.dismiss(toastId);
            toast.success("File CSV berhasil diunduh", {
                description: `${finalFilename} (${selectedCount} kolom)`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Export CSV error:", error);
            toast.dismiss(toastId);
            toast.error(
                error instanceof Error ? error.message : "Terjadi kesalahan saat mengekspor data."
            );
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!isDownloading) onOpenChange(val); }}>
            <DialogContent
                showCloseButton={!isDownloading}
                className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-[94vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 gap-0 overflow-hidden bg-background border border-border text-foreground rounded-2xl flex flex-col max-h-[90dvh] sm:max-h-[88vh] shadow-2xl"
            >
                {/* Header: Clean, prominent title without bulky icon boxes */}
                <DialogHeader className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border shrink-0 text-left">
                    <div className="space-y-1 pr-8 sm:pr-6">
                        <DialogTitle className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground leading-normal">
                            {description || `Pilih cakupan data ${entityName ? entityName.toLowerCase() : ""} dan tentukan kolom yang ingin diekspor ke file CSV.`}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                {/* Body: Responsive & scrollable */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-5">
                    {/* Section 1: Cakupan Data */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground tracking-tight block">
                            Cakupan Data
                        </Label>

                        <Tabs
                            value={exportFilterMode}
                            onValueChange={(val) => setExportFilterMode(val as "all" | "filtered")}
                            className="w-full sm:w-auto"
                        >
                            <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex bg-muted/60 border border-border p-1 h-10 rounded-lg">
                                <TabsTrigger
                                    value="all"
                                    className="text-xs sm:text-sm font-medium px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-md transition-all truncate"
                                >
                                    Semua Data ({totalCount})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="filtered"
                                    className="text-xs sm:text-sm font-medium px-2 sm:px-4 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs rounded-md transition-all gap-1 sm:gap-2 min-w-0"
                                >
                                    <span className="truncate">Sesuai Filter</span>
                                    {(hasActiveFilters || activeFilterBadges.length > 0) && (
                                        <Badge
                                            variant="secondary"
                                            className="h-5 px-1.5 text-xs font-normal shrink-0"
                                        >
                                            Aktif
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* Filter controls displayed when filtered mode is active */}
                        {exportFilterMode === "filtered" && (
                            <div className="space-y-3 pt-1">
                                {activeFilterBadges.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground text-xs sm:text-sm">Filter aktif:</span>
                                        {activeFilterBadges.map((badge) => (
                                            <Badge
                                                key={badge.key}
                                                variant="outline"
                                                className="px-2.5 py-1 text-xs sm:text-sm font-normal bg-background/80 border-border gap-1.5"
                                            >
                                                <span className="text-muted-foreground">{badge.label}:</span>
                                                <span className="font-medium text-foreground">{badge.value}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {filterControlContent && (
                                    <div className="pt-0.5">
                                        {filterControlContent}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Pilihan Kolom Ekspor */}
                    <div className="space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <Label className="text-sm font-semibold text-foreground tracking-tight">
                                    Kolom Data
                                </Label>
                                <span className="text-xs font-mono font-medium text-muted-foreground">
                                    {selectedCount} dari {allKeys.length} kolom dipilih
                                </span>
                            </div>

                            {/* Action Buttons: Responsive, small icons & color accents */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={selectAllVisible}
                                    disabled={visibleKeys.length === 0 || isAllVisibleSelected}
                                    className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm font-medium hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-colors"
                                >
                                    <CheckCheck className="size-3.5 mr-1.5 text-emerald-400 shrink-0" />
                                    Pilih Semua
                                </Button>
                                {essentialColumns && essentialColumns.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={selectEssential}
                                        className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm font-medium hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-colors"
                                    >
                                        <Bookmark className="size-3.5 mr-1.5 text-sky-400 shrink-0" />
                                        Esensial
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={deselectAllVisible}
                                    disabled={visibleKeys.length === 0 || isNoneVisibleSelected}
                                    className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm font-medium text-red-400 border-border hover:border-red-500/40 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:text-muted-foreground disabled:border-border"
                                >
                                    <Trash2 className="size-3.5 mr-1.5 text-red-400 shrink-0" />
                                    Hapus Pilihan
                                </Button>
                            </div>
                        </div>

                        {/* Search Input: Clean & accessible */}
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchColumn}
                                onChange={(e) => setSearchColumn(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                    }
                                }}
                                aria-label="Cari kolom data"
                                placeholder="Cari nama kolom..."
                                className="h-10 pl-9 pr-9 text-sm rounded-lg border-border bg-background focus-visible:ring-2"
                            />
                            {searchColumn && (
                                <button
                                    type="button"
                                    onClick={() => setSearchColumn("")}
                                    aria-label="Hapus pencarian"
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 p-1 rounded-md transition-colors"
                                >
                                    <X className="size-4" />
                                </button>
                            )}
                        </div>

                        {/* Column Groups: Clean list layout without nested card components */}
                        {filteredGroups.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                                Tidak ada kolom yang cocok dengan &quot;{searchColumn}&quot;
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 pt-1">
                                {filteredGroups.map((group) => {
                                    const groupSelectedCount = group.keys.filter((k) => cols[k]).length;
                                    const isGroupAll = groupSelectedCount === group.keys.length;

                                    return (
                                        <div
                                            key={group.title}
                                            className="space-y-1"
                                        >
                                            <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                                                <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                                                    {group.title}
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        ({groupSelectedCount}/{group.keys.length})
                                                    </span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleGroup(group.keys)}
                                                    aria-label={`${isGroupAll ? "Batalkan" : "Pilih"} semua kolom ${group.title}`}
                                                    className={cn(
                                                        "inline-flex items-center text-xs font-medium px-2 py-0.5 rounded transition-colors cursor-pointer select-none",
                                                        isGroupAll
                                                            ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                                    )}
                                                >
                                                    {isGroupAll ? (
                                                        <>
                                                            <X className="size-3 mr-1 shrink-0" />
                                                            <span>Batal</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="size-3 mr-1 shrink-0" />
                                                            <span>Pilih</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="space-y-0.5 pt-0.5">
                                                {group.keys.map((key) => {
                                                    const isChecked = Boolean(cols[key]);
                                                    const labelText = columnLabels[key] || key;

                                                    return (
                                                        <ColumnCheckboxRow
                                                            key={key}
                                                            id={`col-${key}`}
                                                            name={key}
                                                            label={labelText}
                                                            checked={isChecked}
                                                            onChange={toggleCol}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer: Compact, always visible & pinned actions */}
                <DialogFooter className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-border bg-background/95 backdrop-blur-xs shrink-0 flex flex-row items-center justify-end gap-2.5 sm:gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => onOpenChange(false)}
                        disabled={isDownloading}
                        className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium flex-1 sm:flex-none hover:border-red-900/40 hover:bg-red-950/20 transition-colors"
                    >
                        <X className="size-3.5 sm:size-4 mr-1.5 text-muted-foreground shrink-0" />
                        Batal
                    </Button>
                    <Button
                        type="button"
                        size="default"
                        onClick={handleDownload}
                        disabled={selectedCount === 0 || isDownloading}
                        className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-semibold flex-1 sm:flex-none bg-white text-zinc-950 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-sm focus-visible:ring-zinc-400 transition-colors disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <Loader2 className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 animate-spin shrink-0" />
                                <span>Mengunduh...</span>
                            </>
                        ) : (
                            <>
                                <Download className="size-3.5 sm:size-4 mr-1.5 sm:mr-2 shrink-0" />
                                <span>Unduh CSV</span>
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
