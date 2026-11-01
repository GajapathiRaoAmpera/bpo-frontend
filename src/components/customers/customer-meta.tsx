import styles from "./customer-meta.module.scss";

export function CustomerMeta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.meta}>
      <dt className={styles.metaLabel}>{label}</dt>
      <dd className={styles.metaValue}>{children}</dd>
    </div>
  );
}
