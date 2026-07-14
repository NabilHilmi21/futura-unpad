"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebarStore } from "./use-sidebar-store"

export function MobileHeader() {
    const { setIsMobileOpen } = useSidebarStore()

    return (
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:hidden">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileOpen(true)}
            >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            <span className="font-semibold">Dashboard</span>
        </header>
    )
}
