import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type CtaLinkProps = {
  children: React.ReactNode;
  className?: string;
  href: string;
  size?: "default" | "compact";
};

export function CtaLink({
  children,
  className,
  href,
  size = "default",
}: CtaLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center justify-center gap-3 rounded-full bg-primary py-1 font-medium text-primary-foreground shadow-lg shadow-orange-500/15 transition hover:bg-primary/90",
        size === "compact"
          ? "h-10 pl-4 pr-1.5 text-sm"
          : "h-12 pl-6 pr-1.5 text-sm",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "grid place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5",
          size === "compact" ? "size-7" : "size-9",
        )}
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}
