"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function VerificationToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isToastShown = useRef(false);

    useEffect(() => {
        if (searchParams.get("verified") === "1" && !isToastShown.current) {
            isToastShown.current = true;
            toast.success("Email verified successfully!", {
                description: "Your account is now fully verified.",
            });
            
            // Clean up the URL by removing the query param
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("verified");
            router.replace(newUrl.pathname + newUrl.search);
        }
    }, [searchParams, router]);

    return null;
}
