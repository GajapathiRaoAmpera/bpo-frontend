import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./error-alert.module.scss";

// Danger box for failed loads and rejected submits. `form` adds an icon and has no retry.
export function ErrorAlert({ children, onRetry, layout = "inline", className }: {
  children: React.ReactNode;
  onRetry?: () => void;
  layout?: "inline" | "stacked" | "form";
  className?: string;
}) {
  return (
    <div role="alert" className={cn(styles.alert, styles[layout], className)}>
      {layout === "form" ? <><CircleAlert aria-hidden className={styles.icon} /><span>{children}</span></> : children}
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
