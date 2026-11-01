import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import styles from "./escalation-resolution.module.scss";

export function EscalationResolution({ escalation: e }: { escalation: Schemas["EscalationRow"] }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Resolution</h2>
      <p className={styles.bodyText}>{e.resolution_note}</p>
      <span className={styles.resolvedBy}>{e.assigned_to_name} · {e.resolved_at && formatDateTime(e.resolved_at)}</span>
    </section>
  );
}
