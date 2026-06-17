"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import UserProfileMenu from "@/components/user-profile-menu"
import { cn } from "@/lib/utils"

export default function Navbar() {
    const { user, isAdmin } = useAuth()
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 60)
        }

        // Initial check
        handleScroll()

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <>
            {/* Invisible spacer to prevent the fixed navbar from overlapping the top of the page */}
            <div className="h-[73px] w-full shrink-0" />
            <header
                className={cn(
                    "fixed top-0 z-50 w-full transition-all duration-700 ease-in-out",
                    isScrolled ? "px-4 pt-4 pb-4 sm:px-6 lg:px-8" : "px-0"
                )}
            >
            <div
                className={cn(
                    "mx-auto flex items-center justify-between gap-4 transition-all duration-700 ease-in-out",
                    isScrolled
                        ? "w-full max-w-7xl rounded-full border border-border/70 bg-background/80 backdrop-blur-xl px-6 py-2.5 shadow-sm"
                        : "w-full max-w-full rounded-none border-b border-border/70 bg-background/95 backdrop-blur-xl px-6 py-3 sm:px-8"
                )}
            >
                <div className="flex items-center gap-8">
                    {isAdmin ? (
                        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
                            Admin Futura
                        </Link>
                    ) : (
                        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
                            Futura
                        </Link>
                    )}

                    <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
                        <Link href="/#details" className="transition hover:text-foreground">
                            Details
                        </Link>
                        <Link href="/registration" className="transition hover:text-foreground">
                            Registration
                        </Link>
                    </nav>
                </div>

                {user ? (
                    <div className="flex min-w-0 items-center gap-3">
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className=""
                            >
                                <Button className={cn("transition-all duration-700 ease-in-out", isScrolled && "rounded-full")}>Admin Dashboard</Button>
                            </Link>
                        )}

                        <UserProfileMenu />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            href="/login"
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                        >
                            Log in
                        </Link>
                        <Button
                            asChild
                            size="sm"
                            className={cn("transition-all duration-700 ease-in-out", isScrolled && "rounded-full")}
                        >
                            <Link href="/register">Register</Link>
                        </Button>
                    </div>
                )}
            </div>
        </header>
        </>
    )
}
