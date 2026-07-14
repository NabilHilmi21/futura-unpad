import { create } from "zustand"

interface SidebarState {
    isMobileOpen: boolean
    setIsMobileOpen: (open: boolean) => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isMobileOpen: false,
    setIsMobileOpen: (open) => set({ isMobileOpen: open }),
}))
