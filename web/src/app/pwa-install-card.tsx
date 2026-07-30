"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallCard() {
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
      return;
    }

    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setPromptEvent(null);
  }

  return (
    <div className="mt-5 overflow-hidden rounded-3xl border bg-white/85 p-3 text-left shadow-xl shadow-sky-950/5 backdrop-blur">
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
        <Button
          className="h-10 rounded-full px-4"
          disabled={!promptEvent}
          onClick={installApp}
          type="button"
        >
          <Download className="size-4" aria-hidden="true" />
          Install
        </Button>
      </div>
      {!promptEvent ? (
        <p className="mt-3 border-t pt-3 text-xs leading-5 text-muted-foreground">
          Use your browser menu and choose Add to Home Screen when install is not shown.
        </p>
      ) : null}
    </div>
  );
}
