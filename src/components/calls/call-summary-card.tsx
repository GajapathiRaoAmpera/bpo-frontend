import { SectionCard } from "@/components/common/section-card";

import styles from "./call-summary-card.module.scss";

export function CallSummaryCard({ summary, nextAction }: { summary: string | null; nextAction: string | null }) {
  return (
    <SectionCard title="AI summary">
      <div className={styles.summary}>
        {summary && <p className={styles.text}>{summary}</p>}
        {nextAction && (
          <div className={styles.nextAction}>
            <span className={styles.noteLabel}>Next action</span>
            <p className={styles.nextText}>{nextAction}</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
