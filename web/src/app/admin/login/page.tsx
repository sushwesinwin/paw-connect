import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, PawPrint, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { loginAdmin } from "./actions";
import { LoginErrorToast } from "./login-error-toast";

export default function AdminLoginPage() {
  const showDemoCredentials = process.env.NODE_ENV !== "production";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@pawconnect.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_15%,oklch(0.92_0.08_80),transparent_32%),linear-gradient(90deg,white,oklch(0.98_0.012_220)_45%,white)] px-3 py-4 text-foreground sm:px-4 sm:py-8">
      <form
        action={loginAdmin}
        className="w-full max-w-md overflow-hidden rounded-3xl border bg-white/90 shadow-xl shadow-sky-950/10 backdrop-blur"
      >
        <div className="flex items-center justify-between gap-2 border-b bg-card/70 px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <PawPrint className="size-5 text-primary" aria-hidden="true" />
            <span className="truncate font-heading text-base font-semibold text-primary sm:text-lg">
              PawConnect
            </span>
          </Link>
          <Link
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 shrink-0 rounded-full px-3 text-muted-foreground",
            )}
            href="/"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back
          </Link>
        </div>

        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <Suspense>
            <LoginErrorToast />
          </Suspense>
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-orange-500/15 sm:size-14">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <h1 className="mt-3 text-center font-heading text-2xl font-normal sm:mt-4 sm:text-3xl">
            Admin login
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-6 text-muted-foreground">
            Sign in to manage admin-only pet care data.
          </p>

          {showDemoCredentials ? (
            <div className="mt-5 rounded-2xl border bg-primary/5 p-3 text-sm sm:p-4">
              <div className="mb-3 flex items-center gap-2 font-medium text-primary">
                <PawPrint className="size-4" aria-hidden="true" />
                Demo admin pass
              </div>
              <div className="grid gap-2">
                <p className="grid gap-1 rounded-xl bg-white px-3 py-2 text-muted-foreground sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <span>Email</span>
                  <span className="break-all font-mono text-xs text-foreground">
                    {adminEmail}
                  </span>
                </p>
                <p className="grid gap-1 rounded-xl bg-white px-3 py-2 text-muted-foreground sm:flex sm:items-center sm:justify-between sm:gap-3">
                  <span>Password</span>
                  <span className="break-all font-mono text-xs text-foreground">
                    {adminPassword}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border bg-primary/5 p-3 text-sm leading-6 text-muted-foreground sm:p-4">
              Use the production admin credentials configured in Vercel
              environment variables.
            </div>
          )}

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium">
              Email
              <input
                className={fieldClass}
                inputMode="email"
                name="email"
                placeholder="admin@pawconnect.local"
                type="text"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Password
              <input
                className={fieldClass}
                name="password"
                placeholder="Enter password"
                type="password"
              />
            </label>
            <Button className="h-11 rounded-full" type="submit">
              Sign in
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}

const fieldClass =
  "h-11 w-full rounded-xl border bg-background px-4 text-sm font-normal outline-none focus:border-ring";
