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
    <div className="flex flex-col justify-between gap-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-label-xs tracking-wider text-outline uppercase">{label}</span>
        <span className="rounded-full bg-secondary-container/30 p-1 text-on-secondary-container"><Icon aria-hidden className="size-3.5" /></span>
      </div>
      <div>
        <span className="text-display text-primary">{value}</span>
        <p className="mt-1 text-body-sm text-on-surface-variant">{note}</p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, bar))}%` }} />
      </div>
    </div>
  );
}

function Card({ title, description, children, className }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card ${className ?? ""}`}>
      <div className="border-b border-surface-container-highest pb-space-md">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        <p className="text-body-sm text-on-surface-variant">{description}</p>
      </div>
      {children}
    </section>
  );
}

function ChartTip({ active, payload, label, money }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; money?: boolean }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="rounded-lg border border-divider bg-surface-container-lowest p-space-sm text-label-sm shadow-popover">
      <p className="mb-1 text-label-md text-on-surface">{formatDate(label)}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-space-sm text-on-surface-variant">
          <span aria-hidden className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="text-data-mono text-on-surface">{money ? formatINR(p.value) : n(p.value)}</span>
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
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Executive Dashboard"
        badge={<Pill tone="live">Last {DAYS} days</Pill>}
        description="Calls handled by the AI voice agent, renewals collected, containment, sentiment and QA across the contact centre. Figures come from the sandbox's synthetic call records."
      />
      {error && (
        <div role="alert" className="flex items-center justify-between rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
          {error.message}
          <Button size="sm" variant="outline" onClick={() => { void summary.refetch(); void trends.refetch(); }}>Try again</Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-5">
        {!s ? Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-40 rounded-lg bg-surface-container-lowest" />) : <>
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

      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <Card className="lg:col-span-8" title="Call volume" description="Calls per day (IST), AI and human-assisted.">
          <div className="h-72">
            {!t ? <Skeleton className="h-full w-full" /> : (
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

        <Card className="lg:col-span-4" title="Call outcomes" description={`Share of ${s ? n(s.calls) : "all"} calls in the period.`}>
          {!s ? <Skeleton className="h-72 w-full" /> : (
            <ul className="flex flex-col gap-space-md">
              {(Object.entries(s.outcomes) as [Schemas["CallOutcome"], number][]).sort((a, b) => b[1] - a[1]).map(([o, count]) => {
                const pct = Math.round((count / Math.max(1, s.calls)) * 100);
                return (
                  <li key={o} className="flex flex-col gap-1">
                    <div className="flex justify-between text-label-sm">
                      <span className="text-on-surface">{OUTCOME_LABEL[o]}</span>
                      <span className="text-data-mono text-on-surface-variant">{n(count)} · {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-low">
                      <div className={`h-full rounded-full ${o === "escalated" ? "bg-error" : "bg-primary-container"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-8" title="Collections" description="Renewal premiums received through payment links, per day.">
          <div className="h-64">
            {!t ? <Skeleton className="h-full w-full" /> : (
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

        <Card className="lg:col-span-4" title="Customer sentiment" description="AI-assessed sentiment per call, per day.">
          <div className="h-48">
            {!t ? <Skeleton className="h-full w-full" /> : (
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
            <ul className="flex justify-between gap-space-sm border-t border-divider pt-space-sm text-label-sm">
              {(["positive", "neutral", "negative"] as const).map((k) => (
                <li key={k} className="flex items-center gap-1.5 text-on-surface-variant">
                  <span aria-hidden className="size-2.5 rounded-sm" style={{ background: SENTIMENT_COLOR[k] }} />
                  {SENTIMENT_LABEL[k]} <span className="text-data-mono text-on-surface">{n(s.sentiment[k] ?? 0)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
