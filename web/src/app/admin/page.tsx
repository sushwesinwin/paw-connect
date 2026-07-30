import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { AdminTable } from "@/app/admin/admin-table";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  AppointmentRequest,
  getAppointments,
  getListings,
  PetListing,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  HeartHandshake,
  LogOut,
  PawPrint,
  Search,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "./logout/actions";

const sidebarItems = [
  { key: "adoption", label: "Adoption", icon: HeartHandshake },
  { key: "lost-found", label: "Lost & Found", icon: Search },
  { key: "vet-grooming", label: "Vet & Grooming", icon: CalendarDays },
];

const tableConfig = {
  adoption: {
    title: "Adoption Posts",
    columns: ["Pet", "Owner", "Species", "Location", "Status", "Created Date"],
  },
  "lost-found": {
    title: "Lost & Found Posts",
    columns: [
      "Report ID",
      "Type",
      "Pet",
      "Reporter",
      "Town or Location",
      "Report Date",
      "Status",
    ],
  },
  "vet-grooming": {
    title: "Vet & Grooming Bookings",
    columns: [
      "Booking ID",
      "Customer",
      "Pet",
      "Service",
      "Assigned Staff",
      "Date",
      "Time",
      "Status",
    ],
  },
};

type SectionKey = keyof typeof tableConfig;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const activeKey = isSectionKey(params.section) ? params.section : "adoption";
  let listings: PetListing[] = [];
  let appointments: AppointmentRequest[] = [];

  try {
    [listings, appointments] = await Promise.all([
      getListings(),
      getAppointments(),
    ]);
  } catch {
    // Keep the dashboard renderable when the API is offline.
  }

  const adoptionListings = listings.filter((item) => item.type === "ADOPTION");
  const lostFoundListings = listings.filter((item) => item.type !== "ADOPTION");
  const summaryBySection: Record<SectionKey, string[][]> = {
    adoption: [["Active Adoption Posts", String(adoptionListings.length)]],
    "lost-found": [["Active Lost & Found Posts", String(lostFoundListings.length)]],
    "vet-grooming": [
      ["Appointments Today", String(appointments.length)],
      [
        "Grooming Bookings Today",
        String(appointments.filter((item) => item.serviceType === "GROOMING").length),
      ],
    ],
  };
  const activeTable = tableConfig[activeKey];
  const activeSummary = summaryBySection[activeKey];
  const activeListings =
    activeKey === "vet-grooming"
      ? []
      : activeKey === "adoption"
        ? adoptionListings
        : lostFoundListings;
  const activeAppointments = activeKey === "vet-grooming" ? appointments : [];
  const counts: Record<SectionKey, number> = {
    adoption: adoptionListings.length,
    "lost-found": lostFoundListings.length,
    "vet-grooming": appointments.length,
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[280px_minmax(0,1fr)] md:px-6">
        <Card className="bg-white/95 p-4 lg:sticky lg:top-5 lg:flex lg:h-[calc(100svh-2.5rem)] lg:flex-col">
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl bg-primary/5 p-3">
              <Link href="/" className="flex items-center gap-2">
                <PawPrint className="size-5 text-primary" aria-hidden="true" />
                <span className="font-heading text-lg font-semibold text-primary">
                  PawConnect
                </span>
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">Admin dashboard</p>
            </div>

            <p className="mt-6 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Services
            </p>
            <nav className="mt-2 grid gap-1" aria-label="Admin navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeKey;

                return (
                  <Link
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    href={`/admin?section=${item.key}`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{item.label}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        isActive
                          ? "bg-white/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {counts[item.key as SectionKey]}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 grid gap-2 border-t pt-4">
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full rounded-full",
              )}
              href="/"
            >
              Back to app
            </Link>
            <form action={logoutAdmin}>
              <button
                className={cn(
                  buttonVariants({ variant: "destructive" }),
                  "h-10 w-full rounded-full",
                )}
                type="submit"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </Card>

        <section className="min-w-0 space-y-5">
          <Card className="bg-white/90">
            <CardHeader>
            <p className="text-sm font-medium text-primary">PawConnect Admin</p>
            <h1 className="font-heading text-3xl font-normal">Pet Care Admin</h1>
            <CardDescription className="max-w-2xl leading-6">
              Manage {activeTable.title.toLowerCase()} users receive from Milo.
            </CardDescription>
            </CardHeader>
          </Card>

          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeSummary.map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 font-heading text-2xl font-medium">{value}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <AdminTable
            section={activeKey}
            title={activeTable.title}
            columns={activeTable.columns}
            listings={activeListings}
            appointments={activeAppointments}
          />
        </section>
      </div>
    </main>
  );
}

function isSectionKey(value: string | undefined): value is SectionKey {
  return Boolean(value && value in tableConfig);
}
