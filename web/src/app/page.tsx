import {
  ArrowRight,
  Bot,
  CalendarDays,
  HeartHandshake,
  MessageCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "./footer";
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

const howItWorks = [
  {
    title: "Ask Milo",
    description: "Start with a pet care question or request.",
  },
  {
    title: "Get guided answers",
    description: "Milo uses care tips, service data, staff schedules, and listings.",
  },
  {
    title: "Request help",
    description: "Book vet or grooming care, search adoption posts, or report lost pets.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_12%,oklch(0.9_0.08_210),transparent_32%),radial-gradient(circle_at_12%_36%,oklch(0.95_0.07_80),transparent_28%),linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <AppNav />
      <section className="mx-auto flex max-w-5xl flex-col gap-12 px-4 pb-12 md:gap-16 md:px-6">
        <div
          className="relative grid min-h-[calc(100svh-5rem)] w-full scroll-mt-28 items-center gap-8 overflow-hidden py-10 text-center md:min-h-[calc(100vh-5rem)] md:grid-cols-[minmax(0,1fr)_380px] md:py-12 md:text-left"
        >
          <div className="relative max-w-2xl">
            <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-white/80 px-3 py-1 text-sm font-medium text-primary shadow-sm shadow-sky-950/5 md:mx-0">
              <MessageCircle className="size-4" aria-hidden="true" />
              AI pet care assistant available 24/7
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
            <Link
              href="/assistant"
              className="group mt-6 inline-flex h-12 items-center justify-center gap-3 rounded-full bg-primary py-1 pl-6 pr-1.5 text-sm font-normal text-primary-foreground shadow-lg shadow-orange-500/15 transition hover:bg-primary/90"
            >
              Ask PawConnect
              <span className="grid size-9 place-items-center rounded-full bg-white text-primary transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {["Adoption", "Lost pets", "Vet care"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border bg-white/75 px-4 py-3 text-sm font-medium shadow-sm shadow-sky-950/5"
                >
                  {item}
                  <p className="mt-1 text-xs font-normal text-muted-foreground">
                    Help from chat
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border bg-white/90 text-left shadow-2xl shadow-sky-950/10 backdrop-blur">
            <div className="flex items-center gap-3 border-b bg-card/80 px-4 py-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-lg font-semibold text-primary">
                  Milo
                </p>
                <p className="text-xs text-muted-foreground">Online now</p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="max-w-[84%] rounded-2xl border bg-white px-4 py-3 text-sm leading-6 shadow-sm">
                Tell me what your pet needs today.
              </div>
              <div className="ml-auto max-w-[84%] rounded-2xl bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground shadow-sm">
                Find a groomer for this week.
              </div>
              <div className="max-w-[88%] rounded-2xl border bg-white px-4 py-3 text-sm leading-6 shadow-sm">
                Nora Groom has openings from 10:00 to 17:00.
              </div>
            </div>
          </div>
        </div>
        <section
          id="how-it-works"
          className="grid scroll-mt-28 gap-6 md:grid-cols-[0.85fr_1.15fr] md:items-center"
        >
          <div className="flex flex-col justify-center">
            <p className="mb-2 text-sm font-medium text-primary">How it works</p>
            <h2 className="font-heading text-2xl font-normal leading-tight md:text-3xl">
              Pet care starts from one chat.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              PawConnect turns common pet care needs into guided next steps.
            </p>
          </div>

          <div className="grid gap-3">
              {howItWorks.map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-2xl border bg-white/85 p-4 shadow-lg shadow-sky-950/5"
              >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading text-base font-medium">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
        <section id="services" className="scroll-mt-28 rounded-3xl bg-zinc-950 px-4 py-6 text-white md:px-6 md:py-8">
          <div className="mb-6 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">Services</p>
            <h2 className="font-heading text-2xl font-normal leading-tight md:text-3xl">
              Pet care workflows in one place.
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Use the assistant to move from question to action without hunting
              through separate tools.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.title}
                  href="/assistant"
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/40 hover:bg-white/[0.07]"
                >
                  <span className="mb-4 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-lg font-medium">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {service.description}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    {service.prompt}
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </section>
      <Footer />
    </main>
  );
}
