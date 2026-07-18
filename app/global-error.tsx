"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import { ServerCrash } from "lucide-react";
import { EB_Garamond, Geist_Mono, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const space_grotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical global runtime error caught in global-error.tsx:", error);
  }, [error]);

  return (
    <html
      lang="id"
      className={cn(
        "h-full",
        "antialiased",
        space_grotesk.variable,
        ebGaramond.variable,
        geistMono.variable,
        "font-sans"
      )}
    >
      <body className="dark">
        <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-4 pb-16 pt-32 sm:px-8">
          <div className="mb-4 text-7xl font-bold tracking-tighter text-muted/30 select-none pointer-events-none">
            500
          </div>
          <ErrorState 
            icon={ServerCrash}
            title="Kesalahan Fatal"
            description="Terjadi kesalahan fatal yang mencegah aplikasi dimuat. Silakan muat ulang halaman atau coba lagi."
            onAction={reset}
            actionLabel="Coba lagi"
            className="-mt-12"
          />
        </main>
      </body>
    </html>
  );
}
