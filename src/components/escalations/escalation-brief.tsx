import { Sparkles } from "lucide-react";

import styles from "./escalation-brief.module.scss";

export function EscalationBrief({ summary }: { summary: string | null | undefined }) {
  return (
    <section className={styles.card}>
      <h2 className={styles.briefTitle}><Sparkles aria-hidden className={styles.briefIcon} />AI context brief</h2>
      <p className={styles.bodyText}>{summary ?? "No call summary is available for this escalation."}</p>
    </section>
  );
}
