import { PhoneCall } from "lucide-react";
import Link from "next/link";

import { Pill } from "@/components/common/pill";
import { PRIORITY_LABEL } from "@/components/escalations/utils";
import { PRIORITY_TONE } from "@/components/ops/tones";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { formatDateTime, formatINR, initials } from "@/lib/format";
import { LANGUAGE_LABEL } from "@/lib/labels";

import styles from "./escalation-overview.module.scss";

export function EscalationOverview({ escalation: e }: { escalation: Schemas["EscalationRow"] }) {
  return (
    <section className={styles.card}>
      <div className={styles.detailHead}>
        <div className={styles.identity}>
          <span aria-hidden className={styles.avatar}>{initials(e.customer_name)}</span>
          <div className={styles.identityText}>
            <h2 className={styles.customerName}>{e.customer_name}</h2>
            <span className={styles.customerContact}>{e.phone} · {e.city}</span>
          </div>
        </div>
        <div className={styles.detailPills}>
          <Pill tone={PRIORITY_TONE[e.priority]}>{PRIORITY_LABEL[e.priority]} priority</Pill>
          <Pill tone={e.status === "resolved" ? "success" : e.status === "assigned" ? "info" : "warning"}>
            {e.status === "open" ? "Unclaimed" : e.status === "assigned" ? `Assigned to ${e.assigned_to_name}` : "Resolved"}
          </Pill>
        </div>
      </div>
      <dl className={styles.facts}>
        {[
          ["Policy", e.policy_no ?? "—"],
          ["Premium", e.premium_inr === null ? "—" : formatINR(e.premium_inr)],
          ["Escalated", formatDateTime(e.created_at)],
          ["Language", LANGUAGE_LABEL[e.preferred_language]],
        ].map(([k, v]) => (
          <div key={k} className={styles.fact}>
            <dt className={styles.label}>{k}</dt>
            <dd className={styles.factValue}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.handoff}>
        <span className={styles.handoffLabel}>Reason for hand-off: </span>{e.reason}
      </div>
      <div className={styles.links}>
        <Button asChild variant="outline"><Link href={`/customers/${e.customer_id}`}>Open Customer 360</Link></Button>
        {e.call_id && <Button asChild variant="outline"><Link href={`/calls/${e.call_id}`}><PhoneCall aria-hidden />Open call {e.call_ref}</Link></Button>}
      </div>
    </section>
  );
}
