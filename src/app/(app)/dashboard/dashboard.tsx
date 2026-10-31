"use client";

import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, IndianRupee, type LucideIcon, PhoneCall, ShieldCheck, Siren } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { OUTCOME_LABEL, SENTIMENT_LABEL } from "@/lib/labels";
import { IS_SANDBOX } from "@/lib/personas";
import { cn } from "@/lib/utils";
import styles from "./dashboard.module.scss";

const DAYS = 30;
const C = { primary: "var(--color-primary)", secondary: "var(--color-secondary)", grid: "var(--color-divider)", text: "var(--color-on-surface-variant)" };
const SENTIMENT_COLOR: Record<Schemas["Sentiment"], string> = {
  positive: "var(--color-secondary)", neutral: "var(--color-outline-variant)", negative: "var(--color-error)",
};
const n = (v: number) => v.toLocaleString("en-IN");
const shortDay = (d: string) => formatDate(d).split(" ").slice(0, 2).join(" ");
// Axis ticks only: ₹ lakh shorthand keeps the axis narrow; tooltips show the exact amount.
const lakh = (v: number) => (v >= 1_00_000 ? `₹${(v / 1_00_000).toFixed(1)}L` : formatINR(v));

function Kpi({ label, icon: Icon, value, note, bar }: { label: string; icon: LucideIcon; value: string; note: string; bar: number }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiTop}>
        <span className={styles.kpiLabel}>{label}</span>
        <span className={styles.kpiIcon}><Icon aria-hidden /></span>
      </div>
      <div>
        <span className={styles.kpiValue}>{value}</span>
        <p className={styles.kpiNote}>{note}</p>
      </div>
      <div className={styles.kpiTrack}>
        <div className={styles.kpiFill} style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} />
      </div>
    </div>
  );
}

function Card({ title, description, children, className }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(styles.card, className)}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      {children}
    </section>
  );
}

function ChartTip({ active, payload, label, money }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; money?: boolean }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className={styles.tip}>
      <p className={styles.tipLabel}>{formatDate(label)}</p>
      {payload.map((p) => (
        <p key={p.name} className={styles.tipRow}>
          <span aria-hidden className={styles.tipSwatch} style={{ background: p.color }} />
          {p.name}: <span className={styles.value}>{money ? formatINR(p.value) : n(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function Dashboard() {
  const summary = useQuery({
    queryKey: ["dashboard", "summary", DAYS],
    queryFn: () => unwrap(api.GET("/api/v1/dashboard/summary", { params: { query: { days: DAYS } } })),
  });
  const trends = useQuery({
    queryKey: ["dashboard", "trends", DAYS],
    queryFn: () => unwrap(api.GET("/api/v1/dashboard/trends", { params: { query: { days: DAYS } } })),
  });
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
        <div role="alert" className={styles.error}>
          {error.message}
          <Button size="sm" variant="outline" onClick={() => { void summary.refetch(); void trends.refetch(); }}>Try again</Button>
        </div>
      )}

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

      <div className={styles.chartGrid}>
        <Card className={styles.wide} title="Call volume" description="Calls per day (IST), AI and human-assisted.">
          <div className={styles.volumeChart}>
            {!t ? <Skeleton className={styles.chartSkeleton} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={t} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={C.grid} />
                  <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--color-surface-container-low)" }} content={<ChartTip />} />
                  <Bar dataKey="calls" name="Calls" fill={C.primary} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className={styles.narrow} title="Call outcomes" description={`Share of ${s ? n(s.calls) : "all"} calls in the period.`}>
          {!s ? <Skeleton className={styles.outcomesSkeleton} /> : (
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
          )}
        </Card>

        <Card className={styles.wide} title="Collections" description="Renewal premiums received through payment links, per day.">
          <div className={styles.collectionsChart}>
            {!t ? <Skeleton className={styles.chartSkeleton} /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={t} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={C.grid} />
                  <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis tickFormatter={lakh} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip money />} />
                  <Area type="monotone" dataKey="collections_inr" name="Collected" stroke={C.secondary} fill={C.secondary} fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className={styles.narrow} title="Customer sentiment" description="AI-assessed sentiment per call, per day.">
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
        </Card>
      </div>
    </div>
  );
}
