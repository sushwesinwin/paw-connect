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
  const counts: Record<SectionKey, number> = {
    adoption: adoptionListings.length,
    "lost-found": lostFoundListings.length,
    "vet-grooming": appointments.length,
    staff: staff.length,
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] text-foreground">
      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-3 md:px-6 md:py-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="bg-white/95 p-3 md:p-4 lg:sticky lg:top-5 lg:flex lg:h-[calc(100svh-2.5rem)] lg:flex-col">
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

            <nav className="mt-3 grid grid-cols-4 gap-1 md:mt-6 md:grid-cols-1" aria-label="Admin navigation">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.key === activeKey;

                return (
                  <Link
                    key={item.label}
                    aria-label={item.label}
                    className={cn(
                      "flex h-11 items-center justify-center rounded-xl px-3 text-sm transition md:h-auto md:justify-start md:gap-2 md:py-2.5",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    href={`/admin?section=${item.key}`}
                    title={item.label}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    <span className="hidden min-w-0 flex-1 md:inline">{item.label}</span>
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

          <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 md:mt-6 md:grid-cols-1 md:pt-4">
            <Link
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-10 w-full rounded-full text-sm",
              )}
              href="/"
            >
              Back to app
            </Link>
            <form action={logoutAdmin}>
              <button
                className={cn(
                  buttonVariants({ variant: "destructive" }),
                  "h-10 w-full rounded-full text-sm",
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
            <CardHeader className="px-4 py-4 md:px-6 md:py-6">
              <p className="text-sm font-medium text-primary">PawConnect Admin</p>
              <h1 className="font-heading text-2xl font-normal md:text-3xl">
                Pet Care Admin
              </h1>
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
