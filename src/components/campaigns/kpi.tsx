import styles from "./kpi.module.scss";

export function Kpi({ label, value, foot, ratio }: { label: string; value: string; foot: string; ratio: number }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${Math.min(ratio, 100)}%` }} />
      </div>
      <span className={styles.kpiFoot}>{foot}</span>
    </div>
  );
}
