"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

import styles from "./sonner.module.scss"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      icons={{
        success: (
          <CircleCheckIcon className={styles.icon} />
        ),
        info: (
          <InfoIcon className={styles.icon} />
        ),
        warning: (
          <TriangleAlertIcon className={styles.icon} />
        ),
        error: (
          <OctagonXIcon className={styles.icon} />
        ),
        loading: (
          <Loader2Icon className={styles.spinner} />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
