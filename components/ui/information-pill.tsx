import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function InfoPill({
    title,
    href,
    className,
}: {
    title: string;
    href?: string;
    className?: string;
}) {
    const Inner = (
        <span className={cn("group flex gap-1 items-center px-4 py-2 bg-primary/10 text-primary rounded-full text-sm border border-primary/20 whitespace-nowrap transition-colors hover:bg-primary/20 cursor-pointer", className)}>
            {title}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
    );
    if (href) {
        return (
            <Link href={href}>
                {Inner}
            </Link>
        );
    }
    return Inner;
}