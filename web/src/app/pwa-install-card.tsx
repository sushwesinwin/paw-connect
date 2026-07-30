"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallCard({
  className,
  variant = "button",
}: {
  className?: string;
  variant?: "button" | "panel";
}) {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return null;
  }

  async function installApp() {
    if (!promptEvent) {
      window.alert("Use your browser menu and choose Add to Home Screen to install PawConnect.");
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setPromptEvent(null);
  }

  if (variant === "panel") {
    return (
      <div
        className={cn(
          "rounded-3xl border bg-white/80 p-3 text-left shadow-lg shadow-sky-950/5 backdrop-blur",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Install PawConnect</p>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              Keep Milo one tap away from your home screen.
            </p>
          </div>
          <button
            className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-950 text-white shadow-lg shadow-zinc-950/15 transition hover:bg-zinc-800"
            onClick={installApp}
            type="button"
          >
            <Download className="size-4" aria-hidden="true" />
            <span className="sr-only">Install PawConnect</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      className={cn(
        "group inline-flex h-12 items-center justify-center gap-2.5 rounded-full border bg-white/75 py-1 pl-5 pr-1.5 text-sm font-medium text-foreground shadow-sm shadow-sky-950/5 backdrop-blur transition hover:border-primary/30 hover:bg-white",
        className,
      )}
      onClick={installApp}
      type="button"
    >
      <Smartphone className="size-4 text-primary" aria-hidden="true" />
      <span>Install app</span>
      <span className="grid size-9 place-items-center rounded-full bg-zinc-950 text-white transition-transform group-hover:translate-y-[-1px]">
        <Download className="size-4" aria-hidden="true" />
      </span>
    </button>
  );
}
