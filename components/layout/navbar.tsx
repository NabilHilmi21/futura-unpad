"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useAuth } from "@/components/auth-provider";
import { User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavbarItem = {
  name: string;
  link: string;
};

export function NavbarDemo() {
  const { user } = useAuth();
  const pathname = usePathname();
  const navItems: NavbarItem[] = [
    {
      name: "Home",
      link: "/",
    },
    {
      name: "About",
      link: "#about",
    },
    {
      name: "Timeline",
      link: "#timeline",
    },
    {
      name: "Registrations",
      link: "#registrations",
    },
  ];
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 
  if (pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/profile" || pathname.startsWith("/profile/")) {
    return null;
  }

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {user ? (
              <NavbarButton
                href="/profile"
                variant="secondary"
                className="flex h-10 w-10 items-center justify-center rounded-full px-0 py-0"
                aria-label="Open profile"
              >
                <User className="h-5 w-5" />
              </NavbarButton>
            ) : (
              <>
                <NavbarButton href="/login" variant="secondary">Login</NavbarButton>
                <NavbarButton href="/register" variant="primary">Register</NavbarButton>
              </>
            )}
          </div>
        </NavBody>
 
        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>
 
          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {user ? (
                <NavbarButton
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="flex h-10 w-10 items-center justify-center rounded-md px-0 py-0"
                  aria-label="Open profile"
                >
                  <User className="h-5 w-5" />
                </NavbarButton>
              ) : (
                <>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/login"
                    variant="primary"
                    className="w-full"
                  >
                    Login
                  </NavbarButton>
                  <NavbarButton
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    href="/register"
                    className="w-full"
                  >
                    Register
                  </NavbarButton>
                </>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
 
      {/* Navbar */}
    </div>
  );
}
 
