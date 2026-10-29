"use client";

import {
  BadgeCheck, CalendarClock, CircleCheck, CircleX, Link2, Search, ShieldAlert, ShieldCheck, Siren, UserRound,
} from "lucide-react";

import { Pill, type PillTone } from "@/components/common/pill";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { formatDuration, LANGUAGE_LABEL, OUTCOME_LABEL, PRODUCT_LABEL, QA_LABEL, SENTIMENT_LABEL, TOOL_LABEL } from "@/lib/labels";

type Session = Schemas["SessionOut"];

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col rounded-lg bg-surface-container-lowest shadow-card">
      <div className="flex items-center justify-between gap-space-sm border-b border-divider px-space-md py-space-sm">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        {action}
      </div>
      <div className="p-space-md">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-space-md py-1.5">
      <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">{label}</dt>
      <dd className="text-right text-data-mono text-on-surface">{children}</dd>
    </div>
  );
}

export function CustomerCard({ session, preview }: { session: Session | undefined; preview: Schemas["QueueItem"] | null }) {
  const customer = session?.customer;
  const policy = session?.policy;
  if (!customer && !preview) {
    return (
      <Card title="Customer">
        <div className="flex flex-col items-center gap-space-sm py-space-lg text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-primary-container">
            <UserRound aria-hidden className="size-5" />
          </span>
          <p className="text-body-sm text-on-surface-variant">
            {session ? "Caller not identified yet. The AI verifies the policy number and date of birth first." : "Select a renewal or take an inbound call."}
          </p>
        </div>
      </Card>
    );
  }
  const name = customer?.full_name ?? preview!.customer_name;
  const verified = session?.verified;
  return (
    <Card
      title="Customer"
      action={session ? (verified
        ? <Pill tone="success"><BadgeCheck aria-hidden className="size-3" />Verified</Pill>
        : <Pill tone="warning"><ShieldAlert aria-hidden className="size-3" />Not yet verified</Pill>) : undefined}
    >
      <div className="flex items-center gap-space-md pb-space-sm">
        <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-headline-sm text-primary">
          {name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-headline-sm text-on-surface">{name}</span>
          <span className="truncate text-label-sm text-on-surface-variant">
            {customer ? `${customer.city}, ${customer.state}` : preview!.city}
          </span>
        </div>
      </div>
      <dl className="divide-y divide-divider border-t border-divider">
        {customer && <Field label="Customer ID">{customer.customer_code}</Field>}
        {customer && <Field label="Mobile">{customer.phone}</Field>}
        <Field label="Language"><Pill tone="lang">{LANGUAGE_LABEL[customer?.preferred_language ?? preview!.preferred_language]}</Pill></Field>
        <Field label="Policy">{policy?.policy_no ?? preview?.policy_no ?? "—"}</Field>
        {(policy || preview) && <Field label="Product">{PRODUCT_LABEL[policy?.product ?? preview!.product]}</Field>}
        {(policy || preview) && <Field label="Premium">{formatINR(policy?.premium_inr ?? preview!.premium_inr)}</Field>}
        {(policy || preview) && <Field label="Renewal due">{formatDate(policy?.renewal_date ?? preview!.renewal_date)}</Field>}
      </dl>
      {session && !verified && (
        <p className="mt-space-sm text-label-sm text-on-surface-variant">The AI shares nothing about this policy until identity is verified.</p>
      )}
    </Card>
  );
}

const TOOL_ICON: Record<string, typeof Search> = {
  verify_customer: ShieldCheck, get_policy_details: Search, send_payment_link: Link2,
  schedule_followup: CalendarClock, escalate_to_human: Siren,
};

export function ActionsTimeline({ session }: { session: Session | undefined }) {
  const actions = session?.turns.filter((t) => t.speaker === "tool") ?? [];
  return (
    <Card title="AI actions" action={actions.length ? <Pill tone="info">{actions.length}</Pill> : undefined}>
      {actions.length === 0 ? (
        <p className="py-space-sm text-body-sm text-on-surface-variant">
          {session ? "Tool calls the AI makes (identity check, policy lookup, payment link, callback, escalation) appear here." : "No call in progress."}
        </p>
      ) : (
        <ol className="relative flex flex-col gap-space-md before:absolute before:top-2 before:bottom-2 before:left-3.25 before:w-px before:bg-divider">
          {actions.map((t) => {
            const ok = Boolean((t.tool_payload?.result as { ok?: boolean } | undefined)?.ok);
            const Icon = TOOL_ICON[t.tool_name ?? ""] ?? Search;
            return (
              <li key={t.seq} className="relative flex gap-space-sm">
                <span className={`z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${ok ? "bg-lang-bg text-secondary" : "bg-danger-bg text-danger-text"}`}>
                  <Icon aria-hidden className="size-3.5" />
                </span>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-space-sm">
                    <span className="text-label-md text-on-surface">{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
                    <span className="text-data-mono text-label-xs text-outline">{formatDuration(t.offset_ms / 1000)}</span>
                  </div>
                  <span className={`text-body-sm ${ok ? "text-on-surface-variant" : "text-danger-text"}`}>{t.text}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

const OUTCOME_TONE: Record<Schemas["CallOutcome"], PillTone> = {
  payment_link_sent: "success", renewed: "success", callback_scheduled: "info", escalated: "danger",
  info_provided: "neutral", not_interested: "warning", no_answer: "neutral",
};
const SENTIMENT_TONE: Record<Schemas["Sentiment"], PillTone> = { positive: "success", neutral: "neutral", negative: "danger" };

export function CallSummary({ session }: { session: Session }) {
  if (session.analysis_pending) {
    return (
      <Card title="Call summary" action={<Pill tone="live" pulse>Analysing</Pill>}>
        <div aria-busy="true" className="flex flex-col gap-space-sm">
          <p className="text-body-sm text-on-surface-variant">Writing the summary and QA score with Gemini…</p>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    );
  }
  const qa = session.qa;
  return (
    <Card title="Call summary" action={session.outcome && <Pill tone={OUTCOME_TONE[session.outcome]}>{OUTCOME_LABEL[session.outcome]}</Pill>}>
      <div className="flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center gap-space-sm text-label-xs font-medium text-on-surface-variant">
          <span className="text-data-mono">{session.call_ref}</span>
          <span>·</span>
          <span>{formatDuration(session.duration_sec)}</span>
          {session.sentiment && <Pill tone={SENTIMENT_TONE[session.sentiment]}>{SENTIMENT_LABEL[session.sentiment]} sentiment</Pill>}
        </div>
        {session.summary && <p className="text-body-md text-on-surface">{session.summary}</p>}
        {session.next_action && (
          <div className="rounded-lg bg-surface-container-low p-space-sm">
            <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">Next action</span>
            <p className="text-body-sm text-on-surface">{session.next_action}</p>
          </div>
        )}
        {qa && (
          <div className="flex flex-col gap-space-sm border-t border-divider pt-space-md">
            <div className="flex items-baseline justify-between">
              <span className="text-label-md text-on-surface">QA score</span>
              <span className="text-headline-md text-primary">{qa.score} / 5</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
                <li key={k} className="flex items-center gap-space-sm text-body-sm">
                  {qa[k]
                    ? <CircleCheck aria-label="Passed" className="size-4 text-success" />
                    : <CircleX aria-label="Failed" className="size-4 text-danger" />}
                  <span className={qa[k] ? "text-on-surface" : "text-danger-text"}>{QA_LABEL[k]}</span>
                </li>
              ))}
            </ul>
            <span className="text-label-xs font-medium text-outline">Scored by AI · QA analysts can review it in QA Review</span>
          </div>
        )}
        {!qa && session.outcome !== "no_answer" && (
          <p className="border-t border-divider pt-space-md text-body-sm text-on-surface-variant">
            QA not scored automatically. A QA analyst will review this call.
          </p>
        )}
      </div>
    </Card>
  );
}
