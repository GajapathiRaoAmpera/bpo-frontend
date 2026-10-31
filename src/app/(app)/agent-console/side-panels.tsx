"use client";

import {
  BadgeCheck, CalendarClock, CircleCheck, CircleX, Link2, Search, ShieldAlert, ShieldCheck, Siren, UserRound,
} from "lucide-react";

import { Pill, type PillTone } from "@/components/common/pill";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { formatDuration, LANGUAGE_LABEL, OUTCOME_LABEL, PRODUCT_LABEL, QA_LABEL, SENTIMENT_LABEL, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./side-panels.module.scss";

type Session = Schemas["SessionOut"];

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{title}</h2>
        {action}
      </div>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.eyebrow}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

export function CustomerCard({ session, preview }: { session: Session | undefined; preview: Schemas["QueueItem"] | null }) {
  const customer = session?.customer;
  const policy = session?.policy;
  if (!customer && !preview) {
    return (
      <Card title="Customer">
        <div className={styles.emptyCustomer}>
          <span className={styles.emptyIcon}>
            <UserRound aria-hidden className={styles.iconLg} />
          </span>
          <p className={styles.muted}>
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
        ? <Pill tone="success"><BadgeCheck aria-hidden className={styles.pillIcon} />Verified</Pill>
        : <Pill tone="warning"><ShieldAlert aria-hidden className={styles.pillIcon} />Not yet verified</Pill>) : undefined}
    >
      <div className={styles.identity}>
        <span aria-hidden className={styles.avatar}>
          {name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
        </span>
        <div className={styles.identityText}>
          <span className={styles.name}>{name}</span>
          <span className={styles.location}>
            {customer ? `${customer.city}, ${customer.state}` : preview!.city}
          </span>
        </div>
      </div>
      <dl className={styles.fields}>
        {customer && <Field label="Customer ID">{customer.customer_code}</Field>}
        {customer && <Field label="Mobile">{customer.phone}</Field>}
        <Field label="Language"><Pill tone="lang">{LANGUAGE_LABEL[customer?.preferred_language ?? preview!.preferred_language]}</Pill></Field>
        <Field label="Policy">{policy?.policy_no ?? preview?.policy_no ?? "—"}</Field>
        {(policy || preview) && <Field label="Product">{PRODUCT_LABEL[policy?.product ?? preview!.product]}</Field>}
        {(policy || preview) && <Field label="Premium">{formatINR(policy?.premium_inr ?? preview!.premium_inr)}</Field>}
        {(policy || preview) && <Field label="Renewal due">{formatDate(policy?.renewal_date ?? preview!.renewal_date)}</Field>}
      </dl>
      {session && !verified && (
        <p className={styles.verifyNote}>The AI shares nothing about this policy until identity is verified.</p>
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
        <p className={styles.noActions}>
          {session ? "Tool calls the AI makes (identity check, policy lookup, payment link, callback, escalation) appear here." : "No call in progress."}
        </p>
      ) : (
        <ol className={styles.timeline}>
          {actions.map((t) => {
            const ok = Boolean((t.tool_payload?.result as { ok?: boolean } | undefined)?.ok);
            const Icon = TOOL_ICON[t.tool_name ?? ""] ?? Search;
            return (
              <li key={t.seq} className={styles.action}>
                <span className={cn(styles.actionIcon, ok ? styles.actionOk : styles.actionFailed)}>
                  <Icon aria-hidden />
                </span>
                <div className={styles.actionBody}>
                  <div className={styles.actionHead}>
                    <span className={styles.label}>{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
                    <span className={styles.time}>{formatDuration(t.offset_ms / 1000)}</span>
                  </div>
                  <span className={cn(styles.actionText, !ok && styles.actionTextFailed)}>{t.text}</span>
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
        <div aria-busy="true" className={styles.pending}>
          <p className={styles.muted}>Writing the summary and QA score with Gemini…</p>
          <Skeleton className={cn(styles.line, styles.lineFull)} />
          <Skeleton className={cn(styles.line, styles.lineLong)} />
          <Skeleton className={cn(styles.line, styles.lineShort)} />
        </div>
      </Card>
    );
  }
  const qa = session.qa;
  return (
    <Card title="Call summary" action={session.outcome && <Pill tone={OUTCOME_TONE[session.outcome]}>{OUTCOME_LABEL[session.outcome]}</Pill>}>
      <div className={styles.stack}>
        <div className={styles.summaryMeta}>
          <span className={styles.mono}>{session.call_ref}</span>
          <span>·</span>
          <span>{formatDuration(session.duration_sec)}</span>
          {session.sentiment && <Pill tone={SENTIMENT_TONE[session.sentiment]}>{SENTIMENT_LABEL[session.sentiment]} sentiment</Pill>}
        </div>
        {session.summary && <p className={styles.summary}>{session.summary}</p>}
        {session.next_action && (
          <div className={styles.nextAction}>
            <span className={styles.eyebrow}>Next action</span>
            <p className={styles.nextActionText}>{session.next_action}</p>
          </div>
        )}
        {qa && (
          <div className={styles.qa}>
            <div className={styles.qaHead}>
              <span className={styles.label}>QA score</span>
              <span className={styles.score}>{qa.score} / 5</span>
            </div>
            <ul className={styles.checks}>
              {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
                <li key={k} className={styles.check}>
                  {qa[k]
                    ? <CircleCheck aria-label="Passed" className={styles.passIcon} />
                    : <CircleX aria-label="Failed" className={styles.failIcon} />}
                  <span className={qa[k] ? styles.passed : styles.failed}>{QA_LABEL[k]}</span>
                </li>
              ))}
            </ul>
            <span className={styles.footnote}>Scored by AI · QA analysts can review it in QA Review</span>
          </div>
        )}
        {!qa && session.outcome !== "no_answer" && (
          <p className={styles.notScored}>
            QA not scored automatically. A QA analyst will review this call.
          </p>
        )}
      </div>
    </Card>
  );
}
