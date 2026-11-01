import { ClipboardCheck, IndianRupee, PhoneCall, ShieldCheck, Siren } from "lucide-react";

import { Kpi } from "@/components/dashboard/kpi";
import { DAYS } from "@/components/dashboard/use-dashboard";
import { n } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatINR } from "@/lib/format";

import styles from "./kpi-row.module.scss";

export function KpiRow({ summary: s }: { summary: Schemas["DashboardSummary"] | undefined }) {
  return (
    <div className={styles.kpiGrid}>
      {!s ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className={styles.kpiSkeleton} />) : <>
        <Kpi label="Calls handled" icon={PhoneCall} value={n(s.calls)} bar={(s.connected / Math.max(1, s.calls)) * 100}
          note={`${n(s.connected)} reached the customer · ${n(s.calls_today)} today`} />
        <Kpi label="Renewals collected" icon={IndianRupee} value={formatINR(s.collections_inr)} bar={(s.renewals / Math.max(1, s.renewals_due_30d + s.renewals)) * 100}
          note={`${n(s.renewals)} payments received · ${n(s.renewals_due_30d)} renewals due in 30 days`} />
        <Kpi label="AI containment" icon={ShieldCheck} value={`${s.ai_contained_pct}%`} bar={s.ai_contained_pct}
          note="Connected calls the AI completed without a human" />
        <Kpi label="Average QA score" icon={ClipboardCheck} value={s.avg_qa_score === null ? "—" : `${s.avg_qa_score} / 5`} bar={((s.avg_qa_score ?? 0) / 5) * 100}
          note="5-point check: disclosure, verification, figures, no mis-selling, close" />
        <Kpi label="Open escalations" icon={Siren} value={n(s.open_escalations)} bar={(s.open_escalations / Math.max(1, s.outcomes.escalated ?? 1)) * 100}
          note={`${n(s.outcomes.escalated ?? 0)} calls escalated to a person in ${DAYS} days`} />
      </>}
    </div>
  );
}
