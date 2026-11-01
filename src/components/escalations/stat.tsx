import { cn } from "@/lib/utils";

import styles from "./stat.module.scss";

export function Stat({ label, value, urgent }: { label: string; value: number | string; urgent?: boolean }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={cn(styles.statValue, urgent && styles.statUrgent)}>{value}</span>
    </div>
  );
}
