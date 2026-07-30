"use server";

import {
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}
