import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

import styles from "./button.module.scss"

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      // DESIGN.md: primary #1F4E9C family (Stitch renders primary as #00377d)
      default: styles.default,
      outline: styles.outline,
      secondary: styles.secondary,
      ai: styles.ai,
      ghost: styles.ghost,
      destructive: styles.destructive,
      link: styles.link,
    },
    size: {
      default: styles.sizeDefault,
      xs: styles.sizeXs,
      sm: styles.sizeSm,
      lg: styles.sizeLg,
      icon: styles.sizeIcon,
      "icon-xs": styles.sizeIconXs,
      "icon-sm": styles.sizeIconSm,
      "icon-lg": styles.sizeIconLg,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

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
