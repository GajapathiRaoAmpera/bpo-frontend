import { cn } from "@/lib/utils";

import styles from "./pill.module.scss";

export type PillTone = "success" | "warning" | "danger" | "neutral" | "lang" | "info" | "live";

export function Pill({ tone = "neutral", pulse, className, children }: {
  tone?: PillTone;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn(styles.pill, styles[tone], className)}>
      {pulse && <span aria-hidden className={styles.dot} />}
      {children}
    </span>
  );
}
