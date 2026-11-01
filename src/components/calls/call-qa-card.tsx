import { CircleCheck, CircleX } from "lucide-react";

import { SectionCard } from "@/components/common/section-card";
import type { Schemas } from "@/lib/api";
import { QA_LABEL } from "@/lib/labels";

import styles from "./call-qa-card.module.scss";

export function CallQACard({ qa }: { qa: Schemas["CallDetail"]["qa"] }) {
  return (
    <SectionCard title="QA score" action={qa && <span className={styles.qaScore}>{qa.score} / 5</span>}>
      {qa ? (
        <div className={styles.qaBlock}>
          <ul className={styles.qaList}>
            {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
              <li key={k} className={styles.qaItem}>
                {qa[k] ? <CircleCheck aria-label="Passed" className={styles.passIcon} /> : <CircleX aria-label="Failed" className={styles.failIcon} />}
                <span className={qa[k] ? styles.passText : styles.failText}>{QA_LABEL[k]}</span>
              </li>
            ))}
          </ul>
          <span className={styles.scoredBy}>Scored by {qa.source === "human" ? "a QA analyst" : "AI"}</span>
        </div>
      ) : <p className={styles.muted}>Not scored. Calls without a conversation, or where automatic analysis failed, are left for a QA analyst.</p>}
    </SectionCard>
  );
}
