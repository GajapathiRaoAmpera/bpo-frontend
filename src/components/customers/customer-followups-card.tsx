import { MessageCircle } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import { FOLLOWUP_KIND_LABEL, FOLLOWUP_STATUS_LABEL, FOLLOWUP_TONE } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import styles from "./customer-followups-card.module.scss";

export function CustomerFollowupsCard({ followups }: { followups: Schemas["Customer360"]["followups"] }) {
  return (
    <SectionCard title="Follow-ups" action={<Pill tone="info">{followups.length}</Pill>}>
      {followups.length === 0 ? (
        <p className={styles.muted}>No payment links, callbacks or reminders for this customer.</p>
      ) : (
        <ul className={styles.list}>
          {followups.map((f) => (
            <li key={f.id} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.followupKind}>{FOLLOWUP_KIND_LABEL[f.kind]} · <span className={styles.followupPolicy}>{f.policy_no}</span></span>
                <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill>
              </div>
              <span className={styles.due}>Due {formatDateTime(f.due_at)}</span>
              {f.message_text && (
                <p className={styles.message}>
                  <MessageCircle aria-hidden className={styles.messageIcon} />{f.message_text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
