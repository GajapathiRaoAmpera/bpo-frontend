import type { LucideIcon } from "lucide-react";

import styles from "./kpi.module.scss";

export function Kpi({ label, icon: Icon, value, note, bar }: { label: string; icon: LucideIcon; value: string; note: string; bar: number }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTop}>
        <span className={styles.kpiLabel}>{label}</span>
        <span className={styles.kpiIcon}><Icon aria-hidden /></span>
      </div>
      <div>
        <span className={styles.kpiValue}>{value}</span>
        <p className={styles.kpiNote}>{note}</p>
      </div>
      <div className={styles.kpiTrack}>
        <div className={styles.kpiFill} style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} />
      </div>
    </div>
  );
}
