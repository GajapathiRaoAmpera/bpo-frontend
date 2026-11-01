import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import { PRIORITY_TONE } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";

import styles from "./call-escalations-card.module.scss";

export function CallEscalationsCard({ escalations }: { escalations: Schemas["CallDetail"]["escalations"] }) {
  return (
    <SectionCard title="Escalations">
      <ul className={styles.list}>
        {escalations.map((e) => (
          <li key={e.id} className={styles.item}>
            <div className={styles.itemHead}>
              <Pill tone={PRIORITY_TONE[e.priority]}>{e.priority}</Pill>
              <Pill tone={e.status === "resolved" ? "success" : "warning"}>{e.status}</Pill>
            </div>
            <p className={styles.reason}>{e.reason}</p>
            {e.resolution_note && <p className={styles.muted}>Resolved{e.assigned_to_name ? ` by ${e.assigned_to_name}` : ""}: {e.resolution_note}</p>}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
