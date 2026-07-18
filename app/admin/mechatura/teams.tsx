"use client";

import { useState, useTransition } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, Eye, FileText, Mail, MoreHorizontal, Phone, Tags, Trash, User, XCircle } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import Link from "next/link";
import { toast } from "sonner";
import { getMechaturaDocumentUrl, updateMechaturaRegistrationStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/confirm-dialog";
import {
    useDeleteMechaturaRegistrationMutation,
    useToggleMechaturaAttendanceMutation,
} from "@/hooks/mutations/use-admin-mutations";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    isMechaturaCompetitionType,
    mechaturaCompetitionLabels,
    paymentStatusLabels,
    type PaymentStatus,
} from "@/lib/payment";
import { formatMechaturaDateTime } from "@/lib/mechatura/format";

export type AdminMechaturaRegistration = {
    id: string;
    team_id: string;
    team_name: string;
    institution: string;
    competition_type: unknown;
    robot_name: string;
    payment_status: string | null;
    attended: boolean | null;
    check_in_time: string | null;
    created_at: string | null;
    registration_status: "approved" | "rejected" | "registered" | "waiting_payment" | null;
    member_document_path: string | null;
    robot_document_path: string | null;
};

export type AdminMechaturaLeader = {
    registration_id: string;
    full_name: string;
    email: string | null;
    phone: string | null;
};

export type MechaturaTeamData = AdminMechaturaRegistration & {
    leader?: AdminMechaturaLeader;
};

const statusClassName: Record<PaymentStatus, string> = {
    unpaid: "bg-zinc-100 text-zinc-700",
    pending: "bg-amber-100 text-amber-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    expired: "bg-slate-100 text-slate-700",
    cancelled: "bg-neutral-100 text-neutral-700",
    settled: "bg-blue-100 text-blue-800",
};

const getStatus = (status: string | null): PaymentStatus =>
    status && status in statusClassName ? (status as PaymentStatus) : "unpaid";

function AttendanceCheckbox({ team }: { team: MechaturaTeamData }) {
    const router = useRouter();
    const toggleAttendance = useToggleMechaturaAttendanceMutation();

    const handleToggle = async (checked: boolean | "indeterminate") => {
        try {
            await toggleAttendance.mutateAsync({
                registration_id: team.id,
                attended: checked === true,
            });
            router.refresh();
        } catch (e) {
            console.error("Error toggling attendance", e);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2">
            <Checkbox
                checked={!!team.attended}
                onCheckedChange={handleToggle}
                disabled={toggleAttendance.isPending}
                aria-label="Attendance status"
                className={toggleAttendance.isPending ? "opacity-50" : ""}
            />
        </div>
    );
}

const copyText = async (value: string | null | undefined, label: string) => {
    if (!value) {
        toast.error(`Tidak ada ${label} untuk disalin`);
        return;
    }
    await navigator.clipboard.writeText(value);
    toast.success(`Berhasil menyalin ${label} ke papan klip`);
};

export function TeamActions({ team, hideViewDetails }: { team: MechaturaTeamData, hideViewDetails?: boolean }) {
    const router = useRouter();
    const deleteTeam = useDeleteMechaturaRegistrationMutation();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleDownload = async (path: string | null, label: string) => {
        if (!path) {
            toast.error(`Tidak ada ${label} yang tersedia`);
            return;
        }
        
        try {
            const url = await getMechaturaDocumentUrl(path);
            if (!url) throw new Error("Pembuatan URL gagal");
            window.open(url, '_blank');
            toast.success(`Membuka ${label}`);
        } catch (error) {
            toast.error(`Gagal mengunduh ${label}`);
        }
    };

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        try {
            await updateMechaturaRegistrationStatus(team.id, status);
            toast.success(status === "approved" ? "Pendaftaran berhasil disetujui" : "Pendaftaran berhasil ditolak");
            router.refresh();
        } catch (error) {
            toast.error(`Gagal memperbarui status pendaftaran`);
            throw error;
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTeam.mutateAsync(team.id);
            toast.success("Tim berhasil dihapus");
            router.refresh();
        } catch (e) {
            toast.error("Gagal menghapus tim");
            throw e; // Let ConfirmDialog catch it for internal error handling too
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {!hideViewDetails && (
                        <>
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/mechatura/${team.id}`} prefetch={false}>
                                    <Eye className="h-4 w-4" />
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Salin</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => copyText(team.team_id, "ID Tim")}>
                            <Tags className="h-4 w-4" />
                            ID Tim
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(team.leader?.email, "Email Ketua")}>
                            <Mail className="h-4 w-4" />
                            Email Ketua
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyText(team.leader?.phone, "Telepon Ketua")}>
                            <Phone className="h-4 w-4" />
                            Telepon Ketua
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Dokumen</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.member_document_path, "Dokumen Anggota")}
                            disabled={!team.member_document_path}
                        >
                            <FileText className="h-4 w-4" />
                            Dok. Anggota
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => handleDownload(team.robot_document_path, "Dokumen Robot")}
                            disabled={!team.robot_document_path}
                        >
                            <FileText className="h-4 w-4" />
                            Dok. Robot
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Pendaftaran</DropdownMenuLabel>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setApproveOpen(true); }}
                            disabled={isPending || team.registration_status === "approved"}
                            className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Setujui
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={(e) => { e.preventDefault(); setRejectOpen(true); }}
                            disabled={isPending || team.registration_status === "rejected"}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                        >
                            <XCircle className="h-4 w-4" />
                            Tolak
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash className="h-4 w-4" />
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <ConfirmDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Hapus tim?"
                description="Tindakan ini akan menghapus permanen tim Mechatura ini, anggota terdaftar, dan dokumen yang diunggah. Tindakan ini tidak dapat dibatalkan."
                confirmText="Hapus tim"
                cancelText="Batal"
                variant="destructive"
                onConfirm={handleDelete}
            />
            <ConfirmDialog
                open={approveOpen}
                onOpenChange={setApproveOpen}
                title="Setujui Pendaftaran Tim?"
                description={`Tindakan ini akan menandai pendaftaran tim ${team.team_name} sebagai disetujui.`}
                confirmText="Setujui Pendaftaran"
                cancelText="Batal"
                variant="default"
                onConfirm={() => handleStatusUpdate("approved")}
            />
            <ConfirmDialog
                open={rejectOpen}
                onOpenChange={setRejectOpen}
                title="Tolak Pendaftaran Tim?"
                description={`Tindakan ini akan menandai pendaftaran tim ${team.team_name} sebagai ditolak. Pastikan Anda memiliki alasan yang sah.`}
                confirmText="Tolak Pendaftaran"
                cancelText="Batal"
                variant="destructive"
                onConfirm={() => handleStatusUpdate("rejected")}
            />
        </>
    );
}

export const columns: ColumnDef<MechaturaTeamData>[] = [
    {
        id: "index",
        header: "#",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.index + 1}</div>
        ),
    },
    {
        accessorKey: "attended",
        header: () => <div className="text-center">Check In</div>,
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <AttendanceCheckbox team={row.original} />
            </div>
        )
    },
    {
        accessorKey: "team_name",
        header: "Tim",
        cell: ({ row }) => (
            <div className="min-w-0">
                <p className="font-medium">{row.original.team_name}</p>
            </div>
        ),
    },
    {
        accessorKey: "competition_type",
        header: "Kategori",
        cell: ({ row }) => {
            const team = row.original;
            const category = isMechaturaCompetitionType(team.competition_type)
                ? mechaturaCompetitionLabels[team.competition_type]
                : "-";
            
            return (
                <div>
                    <p className="font-medium">{category}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {team.robot_name}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "leader",
        header: "Ketua",
        cell: ({ row }) => {
            const leader = row.original.leader;
            return (
                <div className="min-w-0">
                    <p className="font-medium">
                        {leader?.full_name ?? "-"}
                    </p>
                    <p className="mt-1 max-w-64 truncate text-xs text-muted-foreground">
                        {leader?.email ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {leader?.phone ?? "-"}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "payment_status",
        header: "Pembayaran",
        cell: ({ row }) => {
            const status = getStatus(row.original.payment_status);
            return (
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName[status]}`}
                >
                    {paymentStatusLabels[status]}
                </span>
            );
        },
    },
    {
        accessorKey: "registration_status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.registration_status;
            if (status === 'approved') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800">Disetujui</span>;
            if (status === 'rejected') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-red-100 text-red-800">Ditolak</span>;
            if (status === 'waiting_payment') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-amber-100 text-amber-800">Menunggu Pembayaran</span>;
            if (status === 'registered') return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800">Terdaftar</span>;
            return <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700">Tidak diketahui</span>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <TeamActions team={row.original} />,
    },
];
