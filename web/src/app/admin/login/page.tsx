import { Button } from "@/components/ui/button";
import { PawPrint } from "lucide-react";
import Link from "next/link";
import { loginAdmin } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] px-4 text-foreground">
      <form
        action={loginAdmin}
        className="w-full max-w-sm rounded-2xl border bg-white/90 p-6 shadow-lg shadow-sky-950/5"
      >
        <Link href="/" className="mb-6 flex items-center gap-2">
          <PawPrint className="size-5 text-primary" aria-hidden="true" />
          <span className="font-heading text-lg font-semibold text-primary">
            PawConnect
          </span>
        </Link>

        <h1 className="font-heading text-2xl font-normal">Admin login</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to manage admin-only pet care data.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Invalid admin credentials.
          </p>
        ) : null}

        <div className="mt-5 grid gap-3">
          <input
            className={fieldClass}
            name="email"
            placeholder="Admin email"
            required
            type="email"
          />
          <input
            className={fieldClass}
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          <Button className="rounded-full" type="submit">
            Sign in
          </Button>
        </div>
      </form>
    </main>
  );
}

const fieldClass =
  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-ring";
