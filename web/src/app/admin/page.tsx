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
  getStaff,
  PetListing,
  StaffMember,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  HeartHandshake,
  LogOut,
  PawPrint,
  Search,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdmin } from "./logout/actions";

const sidebarItems = [
  { key: "adoption", label: "Adoption", icon: HeartHandshake },
  { key: "lost-found", label: "Lost & Found", icon: Search },
  { key: "vet-grooming", label: "Vet & Grooming", icon: CalendarDays },
  { key: "staff", label: "Staff", icon: Stethoscope },
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
  staff: {
    title: "Vet & Grooming Staff",
    columns: [
      "Staff Name",
      "Role",
      "Specialty",
      "Available Days",
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
  let staff: StaffMember[] = [];

  try {
    [listings, appointments, staff] = await Promise.all([
      getListings(),
      getAppointments(),
      getStaff(),
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
    staff: [
      ["Available Staff", String(staff.filter((item) => item.status === "AVAILABLE").length)],
      ["Total Staff", String(staff.length)],
    ],
  };
  const activeTable = tableConfig[activeKey];
  const activeSummary = summaryBySection[activeKey];
  const activeListings =
    activeKey === "vet-grooming" || activeKey === "staff"
      ? []
      : activeKey === "adoption"
        ? adoptionListings
        : lostFoundListings;
  const activeAppointments = activeKey === "vet-grooming" ? appointments : [];
  const activeStaff = activeKey === "staff" ? staff : [];
  const ActiveIcon = sidebarItems.find((item) => item.key === activeKey)?.icon ?? PawPrint;
  const counts: Record<SectionKey, number> = {
    adoption: adoptionListings.length,
    "lost-found": lostFoundListings.length,
    "vet-grooming": appointments.length,
    staff: staff.length,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_78%_8%,oklch(0.9_0.08_210),transparent_28%),linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <div className="mx-auto grid max-w-7xl gap-3 px-2.5 py-2.5 sm:px-4 md:gap-4 md:px-6 md:py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="overflow-hidden bg-white/95 p-0 shadow-xl shadow-sky-950/5 lg:sticky lg:top-5 lg:flex lg:h-[calc(100svh-2.5rem)] lg:flex-col">
          <div className="min-w-0 flex-1">
            <div className="bg-zinc-950 p-3 text-white md:p-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary md:size-9">
                  <PawPrint className="size-4 md:size-5" aria-hidden="true" />
                </span>
                <span className="font-heading text-base font-semibold md:text-lg">
                  PawConnect
                </span>
              </Link>
              <p className="mt-1 text-xs text-zinc-400 md:mt-2">Admin dashboard</p>
            </div>

            <nav className="grid grid-cols-2 gap-1.5 p-2.5 md:grid-cols-1 md:p-4" aria-label="Admin navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeKey;

                return (
                  <Link
                    key={item.label}
                    aria-label={item.label}
                    className={cn(
                      "flex h-10 items-center justify-start gap-2 rounded-xl px-2.5 text-xs transition sm:text-sm md:h-auto md:px-3 md:py-2.5",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-orange-500/15"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    href={`/admin?section=${item.key}`}
                    title={item.label}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-xs md:inline",
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

          <div className="grid grid-cols-2 gap-2 border-t p-2.5 md:grid-cols-1 md:p-4">
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-9 w-full rounded-full text-xs sm:text-sm md:h-10",
              )}
              href="/"
            >
              Back to app
            </Link>
            <form action={logoutAdmin}>
              <button
                className={cn(
                  buttonVariants({ variant: "destructive" }),
                  "h-9 w-full rounded-full text-xs sm:text-sm md:h-10",
                )}
                type="submit"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </button>
            </form>
          </div>
        </Card>

        <section className="min-w-0 space-y-4 md:space-y-5">
          <Card className="overflow-hidden bg-white/90 shadow-xl shadow-sky-950/5">
            <CardHeader className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
              <div>
                <p className="text-sm font-medium text-primary">PawConnect Admin</p>
                <h1 className="font-heading text-xl font-normal leading-tight sm:text-2xl md:text-3xl">
                  {activeTable.title}
                </h1>
                <CardDescription className="mt-1 max-w-2xl text-sm leading-6">
                  Manage records users receive from Milo.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border bg-white px-3 py-2.5 shadow-sm md:px-4 md:py-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary md:size-10">
                  <ActiveIcon className="size-4 md:size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Total records</p>
                  <p className="font-heading text-xl font-medium md:text-2xl">
                    {counts[activeKey]}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <section className="grid gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3">
            {activeSummary.map(([label, value]) => (
              <Card key={label} className="bg-white/90 shadow-lg shadow-sky-950/5">
                <CardContent className="flex items-center justify-between gap-3 p-3 md:block md:p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="font-heading text-2xl font-medium md:mt-2">{value}</p>
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
            staff={activeStaff}
          />
        </section>
      </div>
    </main>
  );
}

function isSectionKey(value: string | undefined): value is SectionKey {
  return Boolean(value && value in tableConfig);
}
