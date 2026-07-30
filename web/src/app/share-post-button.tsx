"use client";

import { Share2 } from "lucide-react";
import { gooeyToast } from "@/components/ui/goey-toaster";

export function SharePostButton({ text }: { text: string }) {
  async function share() {
    const url = `${window.location.origin}/#lost-found`;

    try {
      if (navigator.share) {
        await navigator.share({ text, url, title: "PawConnect Lost & Found" });
        return;
      }

      await navigator.clipboard.writeText(`${text}\n${url}`);
      gooeyToast.success("Share link copied");
    } catch {
      gooeyToast.error("Could not share post");
    }
  }

  return (
    <button
      className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      type="button"
      onClick={() => void share()}
    >
      <Share2 className="size-4" aria-hidden="true" />
      Share
    </button>
  );
}
