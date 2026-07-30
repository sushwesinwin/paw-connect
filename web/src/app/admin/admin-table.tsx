"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { gooeyToast } from "@/components/ui/goey-toaster";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AppointmentInput,
  AppointmentRequest,
  createAppointment,
  createListing,
  createStaff,
  deleteAppointment,
  deleteListing,
  deleteStaff,
  ListingType,
  PetListing,
  PetListingInput,
  StaffInput,
  StaffMember,
  updateAppointment,
  updateListing,
  updateStaff,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useMemo, useState, useTransition } from "react";
import { z } from "zod";

type SectionKey = "adoption" | "lost-found" | "vet-grooming" | "staff";

type AdminTableProps = {
  section: SectionKey;
  title: string;
  columns: string[];
  listings: PetListing[];
  appointments: AppointmentRequest[];
  staff: StaffMember[];
};

type FormState = Record<string, string>;
type ModalState = { mode: "add" | "edit"; id?: string; form: FormState } | null;

const listingSchema = z
  .object({
    type: z.enum(["LOST", "FOUND", "ADOPTION"]),
    petName: z.string().optional(),
    petType: z.string().trim().min(1, "Species is required"),
    breed: z.string().optional(),
    age: z.string().optional(),
    location: z.string().trim().min(1, "Location is required"),
    description: z.string().trim().min(1, "Description is required"),
    contactName: z.string().trim().min(1, "Owner / reporter is required"),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email("Enter a valid email").optional(),
  })
  .refine((value) => value.contactPhone || value.contactEmail, {
    message: "Phone or email is required",
    path: ["contactEmail"],
  });

const appointmentSchema = z
  .object({
    serviceType: z.enum(["VET", "GROOMING"]),
    petName: z.string().trim().min(1, "Pet name is required"),
    petType: z.string().trim().min(1, "Species is required"),
    preferredAt: z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "Preferred date and time is required",
    }),
    contactName: z.string().trim().min(1, "Customer is required"),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email("Enter a valid email").optional(),
    notes: z.string().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  })
  .refine((value) => value.contactPhone || value.contactEmail, {
    message: "Phone or email is required",
    path: ["contactEmail"],
  });

const staffSchema = z.object({
  name: z.string().trim().min(1, "Staff name is required"),
  role: z.enum(["VET", "GROOMER"]),
  specialty: z.string().trim().min(1, "Specialty is required"),
  availableDays: z.array(z.string()).min(1, "Available days are required"),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
  status: z.enum(["AVAILABLE", "BUSY", "OFF_DUTY", "ON_LEAVE"]).optional(),
});

export function AdminTable({
  section,
  title,
  columns,
  listings,
  appointments,
  staff,
}: AdminTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [modal, setModal] = useState<ModalState>(null);
  const [saving, setSaving] = useState(false);
  const rows = useMemo(
    () => getRows(section, listings, appointments, staff),
    [section, listings, appointments, staff],
  );
  const statusOptions = useMemo(
    () => [...new Set(rows.map((row) => row.status))],
    [rows],
  );
  const visibleRows = rows.filter((row) => {
    const matchesStatus = status === "All statuses" || row.status === status;
    const matchesQuery = row.cells
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  function openAdd() {
    setModal({
      mode: "add",
      form:
        section === "staff"
          ? defaultStaffForm()
          : section === "vet-grooming"
          ? defaultAppointmentForm()
          : defaultListingForm(section),
    });
  }

  function openEdit(row: AdminRow) {
    setModal({
      mode: "edit",
      id: row.id,
      form:
        row.kind === "staff"
          ? staffToForm(row.record)
          : row.kind === "appointment"
          ? appointmentToForm(row.record)
          : listingToForm(row.record),
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!modal) {
      return;
    }

    try {
      setSaving(true);
      if (section === "staff") {
        const payload = staffPayload(modal.form);
        if (modal.mode === "edit" && modal.id) {
          await updateStaff(modal.id, payload);
        } else {
          await createStaff(payload);
        }
      } else if (section === "vet-grooming") {
        const payload = appointmentPayload(modal.form);
        if (modal.mode === "edit" && modal.id) {
          await updateAppointment(modal.id, payload);
        } else {
          await createAppointment(payload);
        }
      } else {
        const payload = listingPayload(section, modal.form);
        if (modal.mode === "edit" && modal.id) {
          await updateListing(modal.id, payload);
        } else {
          await createListing(payload);
        }
      }

      setModal(null);
      gooeyToast.success(modal.mode === "edit" ? "Changes saved" : "Record added");
      startTransition(() => router.refresh());
    } catch (error) {
      showToastError(error, "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(row: AdminRow) {
    if (!window.confirm("Delete this record? This cannot be undone.")) {
      return;
    }

    try {
      setSaving(true);
      if (row.kind === "staff") {
        await deleteStaff(row.id);
      } else if (row.kind === "appointment") {
        await deleteAppointment(row.id);
      } else {
        await deleteListing(row.id);
      }
      gooeyToast.success("Record deleted");
      startTransition(() => router.refresh());
    } catch (error) {
      showToastError(error, "Could not delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Card id={section} className="scroll-mt-5 overflow-hidden">
        <CardHeader className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-6">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              Search, filter, export, add, and edit records.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={cn(buttonVariants(), "h-9 rounded-full px-3 text-sm md:px-4")}
              type="button"
              onClick={openAdd}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add New
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 md:px-6 md:pb-6">
          <div className="flex flex-col gap-2 md:flex-row">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={`Search ${title.toLowerCase()}`}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <StatusFilter
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
          </div>

          <div className="mt-4 w-full overflow-x-auto rounded-2xl [-webkit-overflow-scrolling:touch]">
            <Table className="min-w-[920px] whitespace-nowrap md:min-w-[1040px]">
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                  <TableHead className="w-[128px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow key={row.id}>
                    {row.cells.map((value, index) => (
                      <TableCell key={`${row.id}-${columns[index]}`}>
                        {columns[index] === "Status" ? (
                          <StatusBadge status={value} />
                        ) : (
                          value
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="w-[128px]">
                      <div className="flex justify-center gap-1.5 md:gap-2">
                        <button
                          className={rowActionClass}
                          disabled={saving}
                          type="button"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="size-4" aria-hidden="true" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          className={cn(rowActionClass, "text-destructive hover:bg-destructive/10")}
                          disabled={saving}
                          type="button"
                          onClick={() => void deleteRow(row)}
                        >
                          <Trash2 className="size-4" aria-hidden="true" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {visibleRows.length} of {rows.length}
          </div>
        </CardContent>
      </Card>

      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 px-4">
          <form
            className="max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl"
            onSubmit={submit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-medium">
                  {modal.mode === "add" ? "Add" : "Edit"} {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save changes directly to the API.
                </p>
              </div>
              <button
                className="grid size-9 place-items-center rounded-full border hover:bg-muted"
                type="button"
                onClick={() => setModal(null)}
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {section === "staff" ? (
                <StaffFields
                  form={modal.form}
                  setForm={(form) => setModal({ ...modal, form })}
                />
              ) : section === "vet-grooming" ? (
                <AppointmentFields
                  form={modal.form}
                  setForm={(form) => setModal({ ...modal, form })}
                />
              ) : (
                <ListingFields
                  section={section}
                  form={modal.form}
                  setForm={(form) => setModal({ ...modal, form })}
                />
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-full px-4")}
                type="button"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className={cn(buttonVariants(), "h-10 rounded-full px-5")}
                disabled={saving || isPending}
                type="submit"
              >
                {saving || isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ListingFields({
  section,
  form,
  setForm,
}: {
  section: SectionKey;
  form: FormState;
  setForm: (form: FormState) => void;
}) {
  return (
    <>
      {section === "lost-found" ? (
        <ChoiceGroup
          label="Type"
          value={form.type}
          options={["LOST", "FOUND"]}
          onChange={(type) => setForm({ ...form, type })}
        />
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Pet name" name="petName" form={form} setForm={setForm} />
        <Field label="Species" name="petType" required form={form} setForm={setForm} />
        <Field label="Breed" name="breed" form={form} setForm={setForm} />
        <Field label="Age" name="age" form={form} setForm={setForm} />
        <Field label="Location" name="location" required form={form} setForm={setForm} />
        <Field label="Owner / reporter" name="contactName" required form={form} setForm={setForm} />
        <Field label="Phone" name="contactPhone" form={form} setForm={setForm} />
        <Field label="Email" name="contactEmail" type="email" form={form} setForm={setForm} />
      </div>
      <Field
        label="Description"
        name="description"
        required
        multiline
        form={form}
        setForm={setForm}
      />
    </>
  );
}

function AppointmentFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
}) {
  return (
    <>
      <ChoiceGroup
        label="Service type"
        value={form.serviceType}
        options={["VET", "GROOMING"]}
        onChange={(serviceType) => setForm({ ...form, serviceType })}
      />
      <ChoiceGroup
        label="Status"
        value={form.status}
        options={["PENDING", "CONFIRMED", "CANCELLED"]}
        onChange={(status) => setForm({ ...form, status })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Pet name" name="petName" required form={form} setForm={setForm} />
        <Field label="Species" name="petType" required form={form} setForm={setForm} />
        <Field
          label="Preferred date and time"
          name="preferredAt"
          type="datetime-local"
          required
          form={form}
          setForm={setForm}
        />
        <Field label="Customer" name="contactName" required form={form} setForm={setForm} />
        <Field label="Phone" name="contactPhone" form={form} setForm={setForm} />
        <Field label="Email" name="contactEmail" type="email" form={form} setForm={setForm} />
      </div>
      <Field label="Notes" name="notes" multiline form={form} setForm={setForm} />
    </>
  );
}

function StaffFields({
  form,
  setForm,
}: {
  form: FormState;
  setForm: (form: FormState) => void;
}) {
  return (
    <>
      <ChoiceGroup
        label="Role"
        value={form.role}
        options={["VET", "GROOMER"]}
        onChange={(role) => setForm({ ...form, role })}
      />
      <ChoiceGroup
        label="Status"
        value={form.status}
        options={["AVAILABLE", "BUSY", "OFF_DUTY", "ON_LEAVE"]}
        onChange={(status) => setForm({ ...form, status })}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Staff name" name="name" required form={form} setForm={setForm} />
        <Field label="Specialty" name="specialty" required form={form} setForm={setForm} />
        <Field
          label="Available days"
          name="availableDays"
          required
          form={form}
          setForm={setForm}
        />
        <Field
          label="Start time"
          name="startTime"
          type="time"
          required
          form={form}
          setForm={setForm}
        />
        <Field
          label="End time"
          name="endTime"
          type="time"
          required
          form={form}
          setForm={setForm}
        />
      </div>
    </>
  );
}

function Field({
  label,
  name,
  form,
  setForm,
  type = "text",
  required,
  multiline,
}: {
  label: string;
  name: string;
  form: FormState;
  setForm: (form: FormState) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const shouldCapitalize = ["petName", "contactName", "name"].includes(name);
  const shared = {
    id: name,
    name,
    required,
    value: form[name] ?? "",
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) =>
      setForm({
        ...form,
        [name]: shouldCapitalize
          ? capitalizeNameInput(event.target.value)
          : event.target.value,
      }),
  };

  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {multiline ? (
        <textarea
          {...shared}
          className="min-h-24 rounded-2xl border bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
      ) : (
        <Input {...shared} type={type} className="font-normal" />
      )}
    </label>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;

          return (
            <button
              key={option}
              className={cn(
                "rounded-full border px-3 py-2 text-sm font-normal transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-white hover:bg-muted",
              )}
              type="button"
              onClick={() => onChange(option)}
            >
              {titleCase(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type AdminRow =
  | { id: string; kind: "listing"; status: string; cells: string[]; record: PetListing }
  | { id: string; kind: "staff"; status: string; cells: string[]; record: StaffMember }
  | {
      id: string;
      kind: "appointment";
      status: string;
      cells: string[];
      record: AppointmentRequest;
    };

function getRows(
  section: SectionKey,
  listings: PetListing[],
  appointments: AppointmentRequest[],
  staff: StaffMember[],
): AdminRow[] {
  if (section === "adoption") {
    return listings.map((listing) => ({
      id: listing.id,
      kind: "listing",
      status: "Active",
      cells: adoptionRow(listing),
      record: listing,
    }));
  }

  if (section === "lost-found") {
    return listings.map((listing) => ({
      id: listing.id,
      kind: "listing",
      status: "Active",
      cells: lostFoundRow(listing),
      record: listing,
    }));
  }

  if (section === "staff") {
    return staff.map((member) => {
      const status = titleCase(member.status);

      return {
        id: member.id,
        kind: "staff",
        status,
        cells: staffRow(member),
        record: member,
      };
    });
  }

  return appointments.map((appointment) => {
    const status = titleCase(appointment.status);

    return {
      id: appointment.id,
      kind: "appointment",
      status,
      cells: appointmentRow(appointment),
      record: appointment,
    };
  });
}

function StatusFilter({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-10 w-full justify-between rounded-full border border-border bg-white px-4 text-sm text-foreground shadow-sm hover:bg-muted/40 md:w-56"
        aria-label="Filter by status"
      >
        <span className="flex min-w-0 items-center gap-1">
          <span className="text-muted-foreground">Filter:</span>
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="left-0 right-auto w-full min-w-56 gap-1 rounded-2xl p-1.5">
        {["All statuses", ...options].map((option) => (
          <DropdownMenuItem
            key={option}
            className="justify-between"
            onClick={(event) => {
              closeMenu(event);
              onChange(option);
            }}
          >
            <span className="flex items-center gap-2">
              {option === "All statuses" ? null : (
                <span
                  className={cn("size-2 rounded-full", statusDotClass(option))}
                  aria-hidden="true"
                />
              )}
              {option}
            </span>
            {option === value ? (
              <Check className="size-4 text-primary" aria-hidden="true" />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function closeMenu(event: MouseEvent<HTMLButtonElement>) {
  event.currentTarget.closest("details")?.removeAttribute("open");
}

function StatusBadge({ status }: { status: string }) {
  return <Badge className={statusClass(status)}>{status}</Badge>;
}

function defaultListingForm(section: SectionKey): FormState {
  return {
    type: section === "adoption" ? "ADOPTION" : "LOST",
    petName: "",
    petType: "",
    breed: "",
    age: "",
    location: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
  };
}

function listingToForm(listing: PetListing): FormState {
  return {
    type: listing.type,
    petName: listing.petName ? capitalizeNameInput(listing.petName) : "",
    petType: listing.petType,
    breed: listing.breed ?? "",
    age: listing.age ?? "",
    location: listing.location,
    description: listing.description,
    contactName: capitalizeNameInput(listing.contactName),
    contactPhone: listing.contactPhone ?? "",
    contactEmail: listing.contactEmail ?? "",
  };
}

function listingPayload(section: SectionKey, form: FormState): PetListingInput {
  return listingSchema.parse({
    type: (section === "adoption" ? "ADOPTION" : form.type) as ListingType,
    petName: optionalName(form.petName),
    petType: form.petType,
    breed: optional(form.breed),
    age: optional(form.age),
    location: form.location,
    description: form.description,
    contactName: capitalizeWords(form.contactName),
    contactPhone: optional(form.contactPhone),
    contactEmail: optional(form.contactEmail),
  }) as PetListingInput;
}

function defaultAppointmentForm(): FormState {
  return {
    serviceType: "VET",
    petName: "",
    petType: "",
    preferredAt: toDateTimeInput(new Date(Date.now() + 86_400_000).toISOString()),
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
    status: "PENDING",
  };
}

function appointmentToForm(appointment: AppointmentRequest): FormState {
  return {
    serviceType: appointment.serviceType,
    petName: capitalizeNameInput(appointment.petName),
    petType: appointment.petType,
    preferredAt: toDateTimeInput(appointment.preferredAt),
    contactName: capitalizeNameInput(appointment.contactName),
    contactPhone: appointment.contactPhone ?? "",
    contactEmail: appointment.contactEmail ?? "",
    notes: appointment.notes ?? "",
    status: appointment.status,
  };
}

function appointmentPayload(form: FormState): AppointmentInput {
  return appointmentSchema.parse({
    serviceType: form.serviceType as AppointmentInput["serviceType"],
    petName: capitalizeWords(form.petName),
    petType: form.petType,
    preferredAt: toIsoDate(form.preferredAt),
    contactName: capitalizeWords(form.contactName),
    contactPhone: optional(form.contactPhone),
    contactEmail: optional(form.contactEmail),
    notes: optional(form.notes),
    status: form.status as AppointmentInput["status"],
  }) as AppointmentInput;
}

function defaultStaffForm(): FormState {
  return {
    name: "",
    role: "VET",
    specialty: "",
    availableDays: "Monday, Tuesday",
    startTime: "09:00",
    endTime: "17:00",
    status: "AVAILABLE",
  };
}

function staffToForm(member: StaffMember): FormState {
  return {
    name: capitalizeNameInput(member.name),
    role: member.role,
    specialty: member.specialty,
    availableDays: member.availableDays.join(", "),
    startTime: member.startTime,
    endTime: member.endTime,
    status: member.status,
  };
}

function staffPayload(form: FormState): StaffInput {
  return staffSchema.parse({
    name: capitalizeWords(form.name),
    role: form.role,
    specialty: form.specialty,
    availableDays: form.availableDays
      .split(",")
      .map((day) => capitalizeWords(day))
      .filter(Boolean),
    startTime: form.startTime,
    endTime: form.endTime,
    status: form.status,
  }) as StaffInput;
}

function showToastError(error: unknown, title: string) {
  if (error instanceof z.ZodError) {
    gooeyToast.error(title, {
      description: error.issues[0]?.message ?? "Check required fields and try again.",
    });
    return;
  }

  gooeyToast.error(title, {
    description: error instanceof Error ? error.message : "Try again.",
  });
}

function optional(value: string) {
  return value.trim() || undefined;
}

function optionalName(value: string) {
  return optional(capitalizeWords(value));
}

function capitalizeNameInput(value: string) {
  return value.replace(
    /\S+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  );
}

function capitalizeWords(value: string) {
  return capitalizeNameInput(value.trim());
}

function toDateTimeInput(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return local.toISOString().slice(0, 16);
}

function toIsoDate(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function adoptionRow(listing: PetListing) {
  return [
    listing.petName ? capitalizeWords(listing.petName) : titleCase(listing.petType),
    capitalizeWords(listing.contactName),
    listing.petType,
    listing.location,
    "Active",
    formatDate(listing.createdAt),
  ];
}

function lostFoundRow(listing: PetListing) {
  return [
    listing.id.slice(-6).toUpperCase(),
    titleCase(listing.type),
    listing.petName ? capitalizeWords(listing.petName) : titleCase(listing.petType),
    capitalizeWords(listing.contactName),
    listing.location,
    formatDate(listing.createdAt),
    "Active",
  ];
}

function appointmentRow(appointment: AppointmentRequest) {
  const date = new Date(appointment.preferredAt);

  return [
    appointment.id.slice(-6).toUpperCase(),
    capitalizeWords(appointment.contactName),
    capitalizeWords(appointment.petName),
    titleCase(appointment.serviceType),
    "Unassigned",
    formatDate(appointment.preferredAt),
    date.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }),
    titleCase(appointment.status),
  ];
}

function staffRow(member: StaffMember) {
  return [
    capitalizeWords(member.name),
    titleCase(member.role),
    member.specialty,
    member.availableDays.join(", "),
    `${member.startTime} - ${member.endTime}`,
    titleCase(member.status),
  ];
}

function statusDotClass(status: string) {
  if (["Active", "Completed"].includes(status)) {
    return "bg-emerald-500";
  }
  if (["Pending", "Busy"].includes(status)) {
    return "bg-yellow-500";
  }
  if (["Confirmed", "In Progress"].includes(status)) {
    return "bg-blue-500";
  }
  if (["Cancelled", "Off Duty"].includes(status)) {
    return "bg-red-500";
  }
  return "bg-zinc-400";
}

function statusClass(status: string) {
  if (["Active", "Completed"].includes(status)) {
    return "bg-emerald-50 text-emerald-700";
  }
  if (["Pending", "Busy"].includes(status)) {
    return "bg-yellow-50 text-yellow-700";
  }
  if (["Confirmed", "In Progress"].includes(status)) {
    return "bg-blue-50 text-blue-700";
  }
  if (["Cancelled", "Off Duty"].includes(status)) {
    return "bg-red-50 text-red-700";
  }
  return "bg-zinc-100 text-zinc-600";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const rowActionClass =
  "inline-grid size-9 place-items-center rounded-full border bg-white transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50 md:size-8";
