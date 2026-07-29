import { CalendarDays, HeartHandshake, MessageCircle, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Chat", href: "#chat", icon: MessageCircle },
  { label: "Adopt", href: "#adopt", icon: HeartHandshake },
  { label: "Lost & Found", href: "#lost-found", icon: Search },
  { label: "Appointments", href: "#appointments", icon: CalendarDays },
];

export function AppNav() {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Paw Connect</p>
          <h1 className="text-2xl font-semibold tracking-normal">
            Pet care assistant
          </h1>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
