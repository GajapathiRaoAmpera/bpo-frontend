"use client";

import { ErrorAlert } from "@/components/common/error-alert";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { ChartCard } from "@/components/dashboard/chart-card";
import { CollectionsChart } from "@/components/dashboard/collections-chart";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { OutcomesList } from "@/components/dashboard/outcomes-list";
import { SentimentChart } from "@/components/dashboard/sentiment-chart";
import { DAYS, useDashboardSummary, useDashboardTrends } from "@/components/dashboard/use-dashboard";
import { n } from "@/components/dashboard/utils";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./dashboard-page.module.scss";

export function DashboardPage() {
  const summary = useDashboardSummary();
  const trends = useDashboardTrends();
  const s = summary.data;
  const t = trends.data;
  const error = summary.error ?? trends.error;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Executive Dashboard"
        badge={<Pill tone="live">Last {DAYS} days</Pill>}
        description={IS_SANDBOX ? "Calls handled by the AI voice agent, renewals collected, containment, sentiment and QA across the contact centre. Figures come from the sandbox's synthetic call records." : "Calls handled by the AI voice agent, renewals collected, containment, sentiment and QA across the contact centre."}
      />
      {error && (
        <ErrorAlert onRetry={() => { void summary.refetch(); void trends.refetch(); }}>{error.message}</ErrorAlert>
      )}

      <KpiRow summary={s} />

      <div className={styles.chartGrid}>
        <ChartCard className={styles.wide} title="Call volume" description="Calls per day (IST), AI and human-assisted.">
          <VolumeChart trends={t} />
        </ChartCard>
        <ChartCard className={styles.narrow} title="Call outcomes" description={`Share of ${s ? n(s.calls) : "all"} calls in the period.`}>
          <OutcomesList summary={s} />
        </ChartCard>
        <ChartCard className={styles.wide} title="Collections" description="Renewal premiums received through payment links, per day.">
          <CollectionsChart trends={t} />
        </ChartCard>
        <ChartCard className={styles.narrow} title="Customer sentiment" description="AI-assessed sentiment per call, per day.">
          <SentimentChart trends={t} summary={s} />
        </ChartCard>
      </div>
    </div>
  );
}
