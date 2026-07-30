import * as React from "react"

import { cn } from "@/lib/utils"

function DropdownMenu({ className, ...props }: React.ComponentProps<"details">) {
  return (
    <details
      data-slot="dropdown-menu"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function DropdownMenuTrigger({
  className,
  ...props
}: React.ComponentProps<"summary">) {
  return (
    <summary
      data-slot="dropdown-menu-trigger"
      className={cn(
        "grid size-8 cursor-pointer list-none place-items-center rounded-full border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/15 open:bg-muted [&::-webkit-details-marker]:hidden",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute right-0 z-20 mt-2 grid min-w-32 gap-1 rounded-2xl border bg-white p-1.5 shadow-lg shadow-sky-950/10",
        className,
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="dropdown-menu-item"
      type="button"
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-foreground transition hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
}
