import { n } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { OUTCOME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./outcomes-list.module.scss";

export function OutcomesList({ summary: s }: { summary: Schemas["DashboardSummary"] | undefined }) {
  if (!s) return <Skeleton className={styles.outcomesSkeleton} />;
  return (
    <ul className={styles.outcomes}>
      {(Object.entries(s.outcomes) as [Schemas["CallOutcome"], number][]).sort((a, b) => b[1] - a[1]).map(([o, count]) => {
        const pct = Math.round((count / Math.max(1, s.calls)) * 100);
        return (
          <li key={o} className={styles.outcome}>
            <div className={styles.outcomeHead}>
              <span className={styles.outcomeName}>{OUTCOME_LABEL[o]}</span>
              <span className={styles.outcomeCount}>{n(count)} · {pct}%</span>
            </div>
            <div className={styles.outcomeTrack}>
              <div className={cn(styles.outcomeFill, o === "escalated" && styles.outcomeFillEscalated)} style={{ width: `${pct}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
