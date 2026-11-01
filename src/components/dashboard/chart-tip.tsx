import { n } from "@/components/dashboard/utils";
import { formatDate, formatINR } from "@/lib/format";

import styles from "./chart-tip.module.scss";

export function ChartTip({ active, payload, label, money }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; money?: boolean }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className={styles.tip}>
      <p className={styles.tipLabel}>{formatDate(label)}</p>
      {payload.map((p) => (
        <p key={p.name} className={styles.tipRow}>
          <span aria-hidden className={styles.tipSwatch} style={{ background: p.color }} />
          {p.name}: <span className={styles.value}>{money ? formatINR(p.value) : n(p.value)}</span>
        </p>
      ))}
    </div>
  );
}
