import styles from "./sandbox-banner.module.scss";

// Stitch: fixed amber strip above the header on every page.
export function SandboxBanner() {
  return (
    <div role="note" className={styles.banner}>
      <div className={styles.inner}>
        <span aria-hidden className={styles.dot} />
        <span>Sandbox environment · synthetic data</span>
      </div>
    </div>
  );
}
