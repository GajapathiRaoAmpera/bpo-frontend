"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTip } from "@/components/dashboard/chart-tip";
import { C, n, shortDay } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { SENTIMENT_LABEL } from "@/lib/labels";

import styles from "./sentiment-chart.module.scss";

const SENTIMENT_COLOR: Record<Schemas["Sentiment"], string> = {
  positive: "var(--color-secondary)", neutral: "var(--color-outline-variant)", negative: "var(--color-error)",
};

// Stacked per-day bars plus the period totals legend underneath.
export function SentimentChart({ trends: t, summary: s }: { trends: Schemas["TrendPoint"][] | undefined; summary: Schemas["DashboardSummary"] | undefined }) {
  return (
    <>
      <div className={styles.sentimentChart}>
        {!t ? <Skeleton className={styles.chartSkeleton} /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={t} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis allowDecimals={false} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "var(--color-surface-container-low)" }} content={<ChartTip />} />
              {(["positive", "neutral", "negative"] as const).map((k) => (
                <Bar key={k} dataKey={k} name={SENTIMENT_LABEL[k]} stackId="s" fill={SENTIMENT_COLOR[k]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {s && (
        <ul className={styles.legend}>
          {(["positive", "neutral", "negative"] as const).map((k) => (
            <li key={k} className={styles.legendItem}>
              <span aria-hidden className={styles.legendSwatch} style={{ background: SENTIMENT_COLOR[k] }} />
              {SENTIMENT_LABEL[k]} <span className={styles.value}>{n(s.sentiment[k] ?? 0)}</span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
