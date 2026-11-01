"use client";

import { Inbox } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { EscalationItem } from "@/components/escalations/escalation-item";
import type { EscalationTab } from "@/components/escalations/use-escalations";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { cn } from "@/lib/utils";

import styles from "./escalation-queue.module.scss";

export function EscalationQueue({ className, tab, onTab, data, isLoading, error, onRetry, selectedId, onSelect }: {
  className?: string;
  tab: EscalationTab;
  onTab: (tab: EscalationTab) => void;
  data: Schemas["EscalationRow"][] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  selectedId: number | undefined;
  onSelect: (id: number) => void;
}) {
  return (
    <section aria-labelledby="queue-h" className={cn(styles.queue, className)}>
      <div className={styles.queueHeader}>
        <h2 id="queue-h" className={styles.sectionTitle}>Triage queue</h2>
        <div role="group" aria-label="Queue" className={styles.tabs}>
          {(["active", "resolved"] as const).map((t) => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => onTab(t)}
              className={cn(styles.tab, tab === t && styles.tabActive)}>
              {t === "active" ? "Open & assigned" : "Recently resolved"}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.queueList}>
        {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className={styles.itemSkeleton} />)}
        {error && <ErrorAlert layout="stacked" onRetry={onRetry}>{error.message}</ErrorAlert>}
        {data?.length === 0 && (
          <EmptyState icon={Inbox} title={tab === "active" ? "No one is waiting" : "Nothing resolved yet"}
            description={tab === "active" ? "When the AI hands a call to a person, it appears here." : "Resolved escalations appear here."} />
        )}
        {data?.map((e) => (
          <EscalationItem key={e.id} escalation={e} selected={e.id === selectedId} onSelect={() => onSelect(e.id)} />
        ))}
      </div>
    </section>
  );
}
