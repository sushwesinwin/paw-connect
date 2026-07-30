import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "w-full rounded-full border bg-background px-4 py-2 text-sm outline-none focus:border-ring",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
