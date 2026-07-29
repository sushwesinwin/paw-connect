"use client";

import { Menu, PawPrint, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "Features", href: "#features" },
];

export function AppNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (isOpen || currentScrollY < 16) {
        setIsHidden(false);
      } else {
        setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 80);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <header
      className={cn(
        "sticky top-2 z-20 px-3 transition-transform duration-300 md:top-4 md:px-4",
        isHidden ? "pointer-events-none -translate-y-24" : "translate-y-0",
      )}
    >
      <div className="relative mx-auto flex w-full max-w-full flex-col gap-2 rounded-2xl border bg-white/90 px-3 py-2.5 shadow-lg shadow-sky-950/5 backdrop-blur sm:w-fit md:flex-row md:items-center md:gap-5 md:rounded-full md:px-5 md:py-3">
        <div className="flex items-center justify-between gap-2">
          <a href="#chat" className="flex items-center gap-2">
            <PawPrint className="size-5 text-primary" aria-hidden="true" />
            <span className="font-heading text-base font-semibold text-primary md:text-lg">
              PawConnect
            </span>
          </a>
          <div className="flex items-center gap-2 md:hidden">
            <a
              href="#chat"
              className={cn(
                buttonVariants(),
                "h-9 rounded-full px-3 text-sm font-normal sm:px-4",
              )}
            >
              Ask PawConnect
            </a>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border text-foreground"
              onClick={() => setIsOpen((current) => !current)}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <nav
          className={cn(
            "items-center gap-1 md:flex",
            isOpen
              ? "absolute left-0 right-0 top-full mt-2 flex flex-col items-stretch rounded-2xl border bg-white/95 p-2 shadow-lg shadow-sky-950/5 backdrop-blur md:static md:mt-0 md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none"
              : "hidden",
          )}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "h-9 justify-start rounded-full text-sm font-normal md:h-10 md:justify-center md:text-base",
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <a
          href="#chat"
          className={cn(
            buttonVariants(),
            "hidden h-10 rounded-full px-6 text-base font-normal md:inline-flex",
          )}
        >
          Ask PawConnect
        </a>
      </div>
    </header>
  );
}
