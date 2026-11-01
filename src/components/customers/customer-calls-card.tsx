import Link from "next/link";

import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import { OUTCOME_TONE } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL } from "@/lib/labels";

import styles from "./customer-calls-card.module.scss";

export function CustomerCallsCard({ calls, callsLevel }: { calls: Schemas["Customer360"]["calls"]; callsLevel: string | undefined }) {
  return (
    <SectionCard title="Recent calls" action={<Pill tone="info">{calls.length}</Pill>}>
      {calls.length === 0 ? (
        <p className={styles.muted}>{callsLevel ? (callsLevel === "own" ? "You haven't handled a call with this customer." : "No calls with this customer yet.") : "Call history isn't part of your role."}</p>
      ) : (
        <ul className={styles.calls}>
          {calls.map((call) => (
            <li key={call.id}>
              <Link href={`/calls/${call.id}`} className={styles.callLink}>
                <div className={styles.stack}>
                  <span className={styles.callRef}>{call.call_ref}</span>
                  <span className={styles.callMeta}>{formatDateTime(call.started_at)} · {call.mode === "renewal" ? "Renewal" : "Inbound"} · {formatDuration(call.duration_sec)}</span>
                </div>
                {call.outcome && <Pill tone={OUTCOME_TONE[call.outcome]}>{OUTCOME_LABEL[call.outcome]}</Pill>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
