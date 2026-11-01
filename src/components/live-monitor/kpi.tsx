import type { Activity } from "lucide-react";

import styles from "./kpi.module.scss";

export function Kpi({ label, value, icon: Icon, note }: { label: string; value: number; icon: typeof Activity; note: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTop}>
        <span className={styles.label}>{label}</span>
        <span className={styles.kpiIcon}><Icon aria-hidden /></span>
      </div>
      <span className={styles.kpiValue}>{value}</span>
      <span className={styles.kpiNote}>{note}</span>
    </div>
  );
}
