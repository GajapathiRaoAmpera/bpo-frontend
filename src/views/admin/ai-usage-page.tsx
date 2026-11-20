"use client";

import { BadgeIndianRupee, ClipboardCheck, IndianRupee, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AgreementChart } from "@/components/admin/ai-usage/agreement-chart";
import { CostChart } from "@/components/admin/ai-usage/cost-chart";
import { QualityChart } from "@/components/admin/ai-usage/quality-chart";
import { AI_DAYS, type AiDays, useAiUsage } from "@/components/admin/ai-usage/use-ai-usage";
import { ErrorAlert } from "@/components/common/error-alert";
import { PageHeader } from "@/components/common/page-header";
import { ChartCard } from "@/components/dashboard/chart-card";
import { Kpi } from "@/components/dashboard/kpi";
import { n } from "@/components/dashboard/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/format";

import styles from "./ai-usage-page.module.scss";

export function AiUsagePage() {
  const [days, setDays] = useState<AiDays>(30);
  const usage = useAiUsage(days);
  const u = usage.data;
  const agreed = u?.checks.reduce((sum, c) => sum + c.agreed, 0) ?? 0;
  const reviewed = u?.checks.reduce((sum, c) => sum + c.reviewed, 0) ?? 0;
  const agreementPct = reviewed ? Math.round((100 * agreed) / reviewed) : null;

  return (
    <div className={styles.page}>
      <PageHeader
        title="AI Usage & Quality"
        description="Estimated Gemini cost and AI call quality. Cost counts live AI calls only; simulated calls are excluded."
        actions={
          <div className={styles.days} role="group" aria-label="Period">
            {AI_DAYS.map((d) => (
              <Button key={d} size="sm" variant={d === days ? "default" : "outline"} aria-pressed={d === days} onClick={() => setDays(d)}>
                {d} days
              </Button>
            ))}
          </div>
        }
      />
      {usage.error && <ErrorAlert onRetry={() => void usage.refetch()}>{usage.error.message}</ErrorAlert>}

      <div className={styles.kpiGrid}>
        {!u ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className={styles.kpiSkeleton} />) : <>
          <Kpi label="Est. Gemini cost" icon={IndianRupee} value={formatINR(u.cost_inr)} bar={100}
            note={`${n(u.voice_minutes)} AI min · ${n(u.analyses)} analyses · ${n(u.messages)} messages`} />
          <Kpi label="Cost per connected call" icon={BadgeIndianRupee} bar={0}
            value={u.cost_per_connected_call_inr === null ? "—" : formatINR(u.cost_per_connected_call_inr)}
            note="Live AI calls that reached the customer" />
          <Kpi label="AI containment" icon={ShieldCheck} value={`${u.contained_pct}%`} bar={u.contained_pct}
            note={`Escalated ${u.escalated_pct}% · taken over ${u.takeover_pct}%`} />
          <Kpi label="AI–QA agreement" icon={ClipboardCheck} value={agreementPct === null ? "—" : `${agreementPct}%`}
            bar={agreementPct ?? 0} note={`${n(u.reviewed_calls)} calls reviewed by QA`} />
        </>}
      </div>

      <div className={styles.chartGrid}>
        <ChartCard className={styles.wide} title="Daily Gemini cost" description="Estimated spend per day (IST): voice agent, call analysis and follow-up messages.">
          <CostChart usage={u} />
        </ChartCard>
        <ChartCard className={styles.narrow} title="AI vs QA reviewer" description="How often the AI's QA check matched the human reviewer's.">
          <AgreementChart usage={u} />
        </ChartCard>
        <ChartCard className={styles.wide} title="Containment & escalation" description="Share of connected calls per day the AI finished alone, and the share escalated.">
          <QualityChart usage={u} />
        </ChartCard>
      </div>
    </div>
  );
}
