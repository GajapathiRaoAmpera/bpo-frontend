"use client";

import { FOLLOWUP_STATUS_LABEL } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";
import { cn } from "@/lib/utils";

import styles from "./status-tabs.module.scss";

type Status = Schemas["FollowupStatus"];
const TABS: (Status | null)[] = ["scheduled", "sent", "done", "cancelled", null];

export function StatusTabs({ status, onChange }: { status: Status | null; onChange: (status: Status | null) => void }) {
  return (
    <div role="group" aria-label="Filter by status" className={styles.tabs}>
      {TABS.map((s) => (
        <button key={s ?? "all"} type="button" aria-pressed={status === s} onClick={() => onChange(s)}
          className={cn(styles.tab, status === s && styles.tabActive)}>
          {s ? FOLLOWUP_STATUS_LABEL[s] : "All"}
        </button>
      ))}
    </div>
  );
}
