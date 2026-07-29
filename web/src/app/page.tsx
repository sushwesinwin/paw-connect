import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  PawPrint,
  Search,
} from "lucide-react";
import { Chat } from "./chat";
import { AppNav } from "./nav";

const services = [
  {
    title: "Adoption search",
    description: "Find pets ready for a new home and ask Milo for matching tips.",
    icon: HeartHandshake,
    prompt: "Ask Milo about adoption",
  },
  {
    title: "Lost & found",
    description: "Post a missing pet, report a found pet, and search recent listings.",
    icon: Search,
    prompt: "Post from chat",
  },
  {
    title: "Vet & grooming",
    description: "Request appointment times for checkups, grooming, and care visits.",
    icon: CalendarDays,
    prompt: "Book from chat",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_70%_20%,oklch(0.9_0.08_210),transparent_34%),linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <AppNav />
      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-4 md:gap-10 md:px-6">
        <div
          id="how-it-works"
          className="relative mx-auto grid min-h-[calc(100svh-5rem)] w-full max-w-5xl scroll-mt-28 items-center gap-6 overflow-hidden pb-8 pt-10 text-center md:mx-0 md:min-h-[calc(100vh-5rem)] md:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)] md:pb-10 md:pt-12 md:text-left"
        >
          <div className="relative max-w-2xl">
            <p className="mb-3 text-sm font-medium text-primary">
              An AI assistant for every pet parent. Available 24/7
            </p>
            <h1 className="font-heading text-3xl font-normal leading-[1.14] text-balance sm:text-4xl md:text-5xl">
              Ask anything about your pet care.{" "}
              <span className="sm:whitespace-nowrap">
                Your pet gets better care.
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:mx-0 md:text-base">
              AI answers grounded in product tips, vet guidance, grooming notes,
              adoption advice, and lost pet help.
            </p>
            <a
              href="#chat"
              className="group mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-primary py-1 pl-6 pr-1.5 text-sm font-normal text-primary-foreground shadow-lg shadow-orange-500/15 transition hover:bg-primary/90"
            >
              Ask PawConnect
              <span className="grid size-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          </div>
          <PawPrint
            className="pointer-events-none mx-auto hidden size-64 text-primary/10 md:block"
            aria-hidden="true"
          />
        </div>
        <section id="services" className="scroll-mt-28">
          <div className="mb-5 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">Services</p>
            <h2 className="font-heading text-2xl font-normal leading-tight md:text-3xl">
              Pet care workflows in one place.
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <a
                  key={service.title}
                  href="#chat"
                  className="rounded-2xl border bg-white/85 p-5 shadow-lg shadow-sky-950/5"
                >
                  <Icon className="mb-4 size-6 text-primary" aria-hidden="true" />
                  <h3 className="font-heading text-lg font-medium">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <p className="mt-4 text-sm font-medium text-primary">
                    {service.prompt}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
        <div id="features" className="scroll-mt-28 pb-8">
          <div id="chat" className="scroll-mt-28">
            <Chat />
          </div>
        </div>
      </section>
    </main>
  );
}
