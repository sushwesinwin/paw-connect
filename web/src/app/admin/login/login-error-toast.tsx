"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gooeyToast } from "@/components/ui/goey-toaster";

export function LoginErrorToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    if (!searchParams.get("error") || shown.current) {
      return;
    }

    shown.current = true;
    gooeyToast.error("Invalid admin credentials", {
      description: "Check the email and password, then try again.",
    });
    router.replace("/admin/login");
  }, [router, searchParams]);

  return null;
}
