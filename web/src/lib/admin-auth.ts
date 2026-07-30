import { cookies } from "next/headers";

const cookieName = "paw_admin_session";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(cookieName)?.value === adminToken();
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export function verifyAdminCredentials(email: string, password: string) {
  return email === adminEmail() && password === adminPassword();
}

function adminEmail() {
  return process.env.ADMIN_EMAIL ?? "admin@pawconnect.local";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "admin123";
}

function adminToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? "dev-admin-session";
}
