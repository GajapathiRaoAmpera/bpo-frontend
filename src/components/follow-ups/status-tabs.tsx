"use client";

import { cn } from "@/lib/utils";

import styles from "./status-tabs.module.scss";

// Status filter pills; null is the "All" tab.
export function StatusTabs<S extends string>({ tabs, labels, status, onChange }: {
  tabs: (S | null)[];
  labels: Record<S, string>;
  status: S | null;
  onChange: (status: S | null) => void;
}) {
  return (
    <div role="group" aria-label="Filter by status" className={styles.tabs}>
      {tabs.map((s) => (
        <button key={s ?? "all"} type="button" aria-pressed={status === s} onClick={() => onChange(s)}
          className={cn(styles.tab, status === s && styles.tabActive)}>
          {s ? labels[s] : "All"}
        </button>
      ))}
    </div>
  );
}
