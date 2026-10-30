"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot, CircleCheck, CircleX, FileQuestion, Headset, UserRound, Wrench } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Pill } from "@/components/common/pill";
import { FOLLOWUP_KIND_LABEL, FOLLOWUP_STATUS_LABEL, FOLLOWUP_TONE, OUTCOME_TONE, PRIORITY_TONE, SENTIMENT_TONE } from "@/components/ops/tones";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError, type Schemas, unwrap } from "@/lib/api";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL, PRODUCT_LABEL, QA_LABEL, SENTIMENT_LABEL, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Turn = Schemas["TurnOut"];

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-lg bg-surface-container-lowest shadow-card">
      <div className="flex items-center justify-between gap-space-sm border-b border-divider px-space-lg py-space-md">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        {action}
      </div>
      <div className="p-space-lg">{children}</div>
    </section>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-label-xs tracking-wider text-outline uppercase">{label}</span>
      <span className="text-label-md text-on-surface">{children}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-space-md py-2">
      <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">{label}</dt>
      <dd className="text-right text-data-mono text-on-surface">{children}</dd>
    </div>
  );
}

const SPEAKER = {
  bot: { label: "AssureVoice AI", icon: Bot, box: "border-lang-border/40 bg-lang-bg/40", tag: "bg-secondary-container/50 text-secondary" },
  customer: { label: "Customer", icon: UserRound, box: "border-divider bg-surface-container-lowest", tag: "bg-surface-container-high text-primary" },
  agent: { label: "Human agent", icon: Headset, box: "border-primary-container/30 bg-surface-container-low", tag: "bg-primary-container text-on-primary" },
} as const;

function TurnItem({ t }: { t: Turn }) {
  if (t.speaker === "tool") {
    // Seeded sample calls store only the tool arguments; only an explicit ok:false is a failure.
    const ok = (t.tool_payload?.result as { ok?: boolean } | undefined)?.ok !== false;
    return (
      <li className={cn("flex items-center gap-space-sm rounded-lg px-space-md py-space-sm text-label-sm", ok ? "bg-surface-container-low text-on-surface-variant" : "bg-danger-bg text-danger-text")}>
        <Wrench aria-hidden className="size-3.5 shrink-0" />
        <span className="font-semibold">{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
        <span className="truncate">{t.text}</span>
        <span className="ml-auto text-data-mono text-label-xs">{formatDuration(t.offset_ms / 1000)}</span>
      </li>
    );
  }
  const s = SPEAKER[t.speaker];
  return (
    <li className={cn("flex flex-col gap-space-xs rounded-lg border p-space-md", s.box)}>
      <div className="flex items-center gap-space-sm text-label-xs">
        <span className={cn("rounded-sm px-1.5 py-0.5 font-semibold", s.tag)}>{s.label}</span>
        <span className="text-data-mono text-on-surface-variant">{formatDuration(t.offset_ms / 1000)}</span>
      </div>
      <p className="text-body-md text-on-surface">{t.text}</p>
    </li>
  );
}

export function CallDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const callId = Number(id);
  const { data: c, isLoading, error, refetch } = useQuery({
    queryKey: ["calls", "detail", callId],
    queryFn: () => unwrap(api.GET("/api/v1/calls/{call_id}", { params: { path: { call_id: callId } } })),
    enabled: Number.isInteger(callId),
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
  });

  const back = <Button asChild variant="outline"><Link href="/calls"><ArrowLeft aria-hidden />Back to call history</Link></Button>;
  if (!Number.isInteger(callId) || (error instanceof ApiError && error.status === 404)) {
    return <EmptyState icon={FileQuestion} title="Call not found" description="This call doesn't exist or isn't one you can open." action={back} />;
  }
  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
        {error.message}<Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }
  if (isLoading || !c) {
    return (
      <div className="flex flex-col gap-space-xl" aria-busy="true">
        <Skeleton className="h-44 rounded-lg bg-surface-container-lowest" />
        <div className="grid grid-cols-12 gap-space-xl">
          <Skeleton className="col-span-8 h-96 rounded-lg bg-surface-container-lowest" />
          <Skeleton className="col-span-4 h-96 rounded-lg bg-surface-container-lowest" />
        </div>
      </div>
    );
  }

  const qa = c.qa;
  return (
    <div className="flex flex-col gap-space-xl">
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-sm text-label-sm text-on-surface-variant">
        <Link href="/calls" className="hover:text-primary hover:underline">Call History</Link>
        <span aria-hidden>›</span>
        <span className="rounded-sm bg-surface-container-high px-1.5 py-0.5 text-data-mono text-primary">{c.call_ref}</span>
      </nav>

      <section className="flex flex-col gap-space-lg rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="flex flex-col gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-sm">
              <Pill tone="info">{c.mode === "renewal" ? "Renewal call" : "Inbound query"}</Pill>
              {c.outcome && <Pill tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Pill>}
              {c.verified ? <Pill tone="success">Identity verified</Pill> : <Pill tone="warning">Not verified</Pill>}
              {c.is_simulated && <Pill tone="neutral">Seeded sample call</Pill>}
            </div>
            <h1 className="text-headline-lg text-on-surface">
              {c.customer?.full_name ?? "Unidentified caller"}{c.policy ? ` · ${c.policy.plan_name}` : ""}
            </h1>
            <div className="flex flex-wrap gap-x-space-lg gap-y-1 text-body-sm text-on-surface-variant">
              {c.customer && <span>{c.customer.phone} · {c.customer.city}, {c.customer.state}</span>}
              {c.policy && <span>Policy <span className="text-data-mono text-primary">{c.policy.policy_no}</span></span>}
              {c.customer && <Link href={`/customers/${c.customer.id}`} className="text-primary-container hover:underline">Open Customer 360</Link>}
            </div>
          </div>
          {back}
        </div>
        <div className="grid grid-cols-2 gap-space-md border-t border-divider pt-space-md md:grid-cols-5">
          <Meta label="Started">{formatDateTime(c.started_at)}</Meta>
          <Meta label="Duration">{formatDuration(c.duration_sec)}</Meta>
          <Meta label="Handled by">{c.agent_name ? `AI, then ${c.agent_name}` : "AI agent"}</Meta>
          <Meta label="Taken over">{c.taken_over_at ? formatDateTime(c.taken_over_at) : "No"}</Meta>
          <Meta label="Sentiment">{c.sentiment ? <Pill tone={SENTIMENT_TONE[c.sentiment]}>{SENTIMENT_LABEL[c.sentiment]}</Pill> : "—"}</Meta>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <div className="flex flex-col gap-space-xl lg:col-span-8">
          {(c.summary || c.next_action) && (
            <Card title="AI summary">
              <div className="flex flex-col gap-space-md">
                {c.summary && <p className="text-body-md text-on-surface">{c.summary}</p>}
                {c.next_action && (
                  <div className="rounded-lg bg-surface-container-low p-space-sm">
                    <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">Next action</span>
                    <p className="text-body-sm text-on-surface">{c.next_action}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
          <Card title="Transcript" action={<Pill tone="info">{c.turns.filter((t) => t.speaker !== "tool").length} turns</Pill>}>
            {c.turns.length === 0
              ? <p className="text-body-sm text-on-surface-variant">No transcript: the customer didn&apos;t answer.</p>
              : <ol className="flex flex-col gap-space-sm">{c.turns.map((t) => <TurnItem key={t.seq} t={t} />)}</ol>}
          </Card>
        </div>

        <div className="flex flex-col gap-space-xl lg:col-span-4">
          <Card title="QA score" action={qa && <span className="text-headline-md text-primary">{qa.score} / 5</span>}>
            {qa ? (
              <div className="flex flex-col gap-space-sm">
                <ul className="flex flex-col gap-space-sm">
                  {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
                    <li key={k} className="flex items-center gap-space-sm text-body-sm">
                      {qa[k] ? <CircleCheck aria-label="Passed" className="size-4 text-success" /> : <CircleX aria-label="Failed" className="size-4 text-danger" />}
                      <span className={qa[k] ? "text-on-surface" : "text-danger-text"}>{QA_LABEL[k]}</span>
                    </li>
                  ))}
                </ul>
                <span className="text-label-xs font-medium text-outline">Scored by {qa.source === "human" ? "a QA analyst" : "AI"}</span>
              </div>
            ) : <p className="text-body-sm text-on-surface-variant">Not scored. Calls without a conversation, or where automatic analysis failed, are left for a QA analyst.</p>}
          </Card>

          {c.policy && (
            <Card title="Policy">
              <dl className="divide-y divide-divider">
                <Field label="Policy no.">{c.policy.policy_no}</Field>
                <Field label="Product">{PRODUCT_LABEL[c.policy.product]}</Field>
                <Field label="Premium">{formatINR(c.policy.premium_inr)}</Field>
                <Field label="Sum insured">{formatINR(c.policy.sum_insured_inr)}</Field>
                <Field label="Renewal due">{formatDate(c.policy.renewal_date)}</Field>
              </dl>
            </Card>
          )}

          {c.escalations.length > 0 && (
            <Card title="Escalations">
              <ul className="flex flex-col gap-space-md">
                {c.escalations.map((e) => (
                  <li key={e.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-space-sm">
                      <Pill tone={PRIORITY_TONE[e.priority]}>{e.priority}</Pill>
                      <Pill tone={e.status === "resolved" ? "success" : "warning"}>{e.status}</Pill>
                    </div>
                    <p className="text-body-sm text-on-surface">{e.reason}</p>
                    {e.resolution_note && <p className="text-body-sm text-on-surface-variant">Resolved{e.assigned_to_name ? ` by ${e.assigned_to_name}` : ""}: {e.resolution_note}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {c.followups.length > 0 && (
            <Card title="Follow-ups">
              <ul className="flex flex-col gap-space-md">
                {c.followups.map((f) => (
                  <li key={f.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="text-label-md text-on-surface">{FOLLOWUP_KIND_LABEL[f.kind]}</span>
                      <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill>
                    </div>
                    <span className="text-label-xs font-medium text-on-surface-variant">Due {formatDateTime(f.due_at)}</span>
                    {f.message_text && <p className="rounded-lg bg-success-bg p-space-sm text-body-sm text-on-surface">{f.message_text}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
