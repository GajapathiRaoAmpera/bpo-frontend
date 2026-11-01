"use client";

import { CheckCircle2, Clock } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { PRIORITY_LABEL } from "@/components/escalations/utils";
import { PRIORITY_TONE } from "@/components/ops/tones";
import { type Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { LANGUAGE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./escalation-item.module.scss";

const BAR: Record<Schemas["Priority"], string> = { urgent: styles.barUrgent, high: styles.barHigh, medium: styles.barMedium, low: styles.barLow };

function waited(since: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  if (mins < 48 * 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d`;
}

export function EscalationItem({ escalation: e, selected, onSelect }: { escalation: Schemas["EscalationRow"]; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
      className={cn(styles.item, selected && styles.itemSelected)}>
      <span aria-hidden className={cn(styles.priorityBar, BAR[e.priority])} />
      <div className={styles.itemHead}>
        <span className={styles.customerName}>{e.customer_name}</span>
        <Pill tone={PRIORITY_TONE[e.priority]}>{PRIORITY_LABEL[e.priority]}</Pill>
      </div>
      <span className={styles.itemContact}>{e.phone} · {e.city}</span>
      {e.policy_no && (
        <div className={styles.itemPolicy}>
          <span className={styles.policyChip}>{e.policy_no}</span>
          <span className={styles.planName}>{e.plan_name}</span>
        </div>
      )}
      <p className={styles.itemReason}>{e.reason}</p>
      <div className={styles.itemFoot}>
        <Pill tone="lang">{LANGUAGE_LABEL[e.preferred_language]}</Pill>
        <span className={styles.itemMeta}>
          {e.status === "resolved" ? <><CheckCircle2 aria-hidden className={cn(styles.smallIcon, styles.resolvedIcon)} />Resolved {e.resolved_at && formatDateTime(e.resolved_at)}</>
            : <><Clock aria-hidden className={styles.smallIcon} />{e.assigned_to_name ? `${e.assigned_to_name} · ` : "Unclaimed · "}waiting {waited(e.created_at)}</>}
        </span>
      </div>
    </button>
  );
}
