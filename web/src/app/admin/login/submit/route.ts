import {
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!verifyAdminCredentials(email, password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}
