import * as React from "react"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-divider bg-surface-container-lowest px-3 py-1 text-body-md text-[#1e293b] transition-[border-color,box-shadow] outline-none placeholder:text-[#94a3b8] focus-visible:border-primary-container focus-visible:ring-3 focus-visible:ring-primary-container/12 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/15",
        className
      )}
      {...props}
    />
  )
}

export { Input }
