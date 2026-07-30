const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function getHealth() {
  const response = await fetch(`${apiUrl}/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json() as Promise<{ status: string; database: string }>;
}

export type ChatCitation = {
  title: string;
  category: string;
};

export type ChatResponse = {
  sessionId: string;
  answer: string;
  citations: ChatCitation[];
};

export async function sendChatMessage(input: {
  sessionId?: string;
  message: string;
}) {
  const response = await fetch(`${apiUrl}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Chat request failed");
  }

  return response.json() as Promise<ChatResponse>;
}

export type ListingType = "LOST" | "FOUND" | "ADOPTION";

export type PetListing = {
  id: string;
  type: ListingType;
  petName?: string;
  petType: string;
  breed?: string;
  age?: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
};

export type PetListingInput = {
  type: ListingType;
  petName?: string;
  petType: string;
  breed?: string;
  age?: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
};

export type AppointmentRequest = {
  id: string;
  serviceType: "VET" | "GROOMING";
  petName: string;
  petType: string;
  preferredAt: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
};

export type AppointmentInput = {
  serviceType: "VET" | "GROOMING";
  petName: string;
  petType: string;
  preferredAt: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  notes?: string;
  status?: AppointmentRequest["status"];
};

export async function getListings() {
  const response = await fetch(`${apiUrl}/listings`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Listings request failed");
  }

  return response.json() as Promise<PetListing[]>;
}

export async function getAppointments() {
  const response = await fetch(`${apiUrl}/appointments`, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Appointments request failed");
  }

  return response.json() as Promise<AppointmentRequest[]>;
}

export function createListing(input: PetListingInput) {
  return requestJson<PetListing>("/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateListing(id: string, input: Partial<PetListingInput>) {
  return requestJson<PetListing>(`/listings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteListing(id: string) {
  return requestJson<PetListing>(`/listings/${id}`, {
    method: "DELETE",
  });
}

export function createAppointment(input: AppointmentInput) {
  return requestJson<AppointmentRequest>("/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAppointment(id: string, input: Partial<AppointmentInput>) {
  return requestJson<AppointmentRequest>(`/appointments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteAppointment(id: string) {
  return requestJson<AppointmentRequest>(`/appointments/${id}`, {
    method: "DELETE",
  });
}

async function requestJson<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<T>;
}

async function getErrorMessage(response: Response) {
  const fallback = `API request failed (${response.status})`;

  try {
    const body = (await response.json()) as { message?: string | string[] };

    if (Array.isArray(body.message)) {
      return body.message.join(", ");
    }

    return body.message ?? fallback;
  } catch {
    return fallback;
  }
}
