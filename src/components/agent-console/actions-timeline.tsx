"use client";

import { CalendarClock, Link2, Search, ShieldCheck, Siren } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import type { Schemas } from "@/lib/api";
import { formatDuration, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./actions-timeline.module.scss";

const TOOL_ICON: Record<string, typeof Search> = {
  verify_customer: ShieldCheck, get_policy_details: Search, send_payment_link: Link2,
  schedule_followup: CalendarClock, escalate_to_human: Siren,
};

export function ActionsTimeline({ session }: { session: Schemas["SessionOut"] | undefined }) {
  const actions = session?.turns.filter((t) => t.speaker === "tool") ?? [];
  return (
    <SectionCard size="sm" title="AI actions" action={actions.length ? <Pill tone="info">{actions.length}</Pill> : undefined}>
      {actions.length === 0 ? (
        <p className={styles.noActions}>
          {session ? "Tool calls the AI makes (identity check, policy lookup, payment link, callback, escalation) appear here." : "No call in progress."}
        </p>
      ) : (
        <ol className={styles.timeline}>
          {actions.map((t) => {
            const ok = Boolean((t.tool_payload?.result as { ok?: boolean } | undefined)?.ok);
            const Icon = TOOL_ICON[t.tool_name ?? ""] ?? Search;
            return (
              <li key={t.seq} className={styles.action}>
                <span className={cn(styles.actionIcon, ok ? styles.actionOk : styles.actionFailed)}>
                  <Icon aria-hidden />
                </span>
                <div className={styles.actionBody}>
                  <div className={styles.actionHead}>
                    <span className={styles.label}>{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
                    <span className={styles.time}>{formatDuration(t.offset_ms / 1000)}</span>
                  </div>
                  <span className={cn(styles.actionText, !ok && styles.actionTextFailed)}>{t.text}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </SectionCard>
  );
}
