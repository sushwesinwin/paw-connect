import { ArrowRight, PawPrint } from "lucide-react";
import Link from "next/link";

const links = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Ask PawConnect", href: "/assistant" },
  { label: "Admin", href: "/admin" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950 px-4 py-9 text-sm text-zinc-500 md:px-6 md:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 md:grid-cols-[1fr_280px] md:items-start">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary"
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary/10">
                <PawPrint className="size-5" aria-hidden="true" />
              </span>
              <span className="font-heading text-xl font-semibold">
                PawConnect
              </span>
            </Link>
            <p className="mt-4 max-w-lg text-base leading-7 text-zinc-300">
              Ask about grooming, vet visits, adoption matches, lost pet reports,
              and everyday care questions from one friendly assistant.
            </p>
            <nav
              className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-medium text-zinc-300"
              aria-label="Footer navigation"
            >
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-heading text-xl font-normal text-white">
              Need pet help now?
            </p>
            <p className="mt-2 leading-6 text-zinc-400">
              Start a chat with Milo for quick care guidance.
            </p>
            <Link
              href="/assistant"
              className="group mt-4 inline-flex h-11 w-full items-center justify-center gap-3 rounded-full bg-primary py-1 pl-5 pr-1.5 font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Ask PawConnect
              <span className="grid size-8 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <p className="mt-4 text-xs">support@pawconnect.local</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs md:flex-row md:items-center md:justify-between">
          <p>Pet care made easier for every home.</p>
          <p>2026 PawConnect</p>
        </div>
      </div>
    </footer>
  );
}
