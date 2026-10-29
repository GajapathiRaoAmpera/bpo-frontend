import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        // DESIGN.md: primary #1F4E9C family (Stitch renders primary as #00377d)
        default: "bg-primary text-on-primary shadow-card hover:bg-primary-container active:bg-[#0f2a56]",
        outline:
          "border-divider bg-surface-container-lowest text-primary-container hover:bg-table-head hover:border-neutral-border aria-expanded:bg-table-head",
        secondary:
          "bg-surface-container-highest text-on-surface hover:bg-surface-container-high aria-expanded:bg-surface-container-high",
        ai: "border-lang-border bg-lang-bg text-secondary hover:bg-[#ccfbf1]",
        ghost:
          "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface aria-expanded:bg-surface-container-high",
        destructive:
          "bg-danger text-white hover:bg-[#dc2626] focus-visible:ring-danger/30",
        link: "text-primary-container underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 gap-1.5 px-3 text-label-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-sm px-2 text-label-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 px-2.5 text-label-sm [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-4 text-label-md",
        icon: "size-9",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
