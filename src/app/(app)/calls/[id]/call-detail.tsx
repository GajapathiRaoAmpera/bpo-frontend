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

import styles from "./call-detail.module.scss";

type Turn = Schemas["TurnOut"];

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

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.meta}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{children}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

const SPEAKER = {
  bot: { label: "AssureVoice AI", icon: Bot, box: styles.turnBot, tag: styles.speakerBot },
  customer: { label: "Customer", icon: UserRound, box: styles.turnCustomer, tag: styles.speakerCustomer },
  agent: { label: "Human agent", icon: Headset, box: styles.turnAgent, tag: styles.speakerAgent },
} as const;

function TurnItem({ t }: { t: Turn }) {
  if (t.speaker === "tool") {
    // Seeded sample calls store only the tool arguments; only an explicit ok:false is a failure.
    const ok = (t.tool_payload?.result as { ok?: boolean } | undefined)?.ok !== false;
    return (
      <li className={cn(styles.toolTurn, !ok && styles.toolFailed)}>
        <Wrench aria-hidden className={styles.toolIcon} />
        <span className={styles.toolName}>{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
        <span className={styles.toolText}>{t.text}</span>
        <span className={styles.toolTime}>{formatDuration(t.offset_ms / 1000)}</span>
      </li>
    );
  }
  const s = SPEAKER[t.speaker];
  return (
    <li className={cn(styles.turn, s.box)}>
      <div className={styles.turnHead}>
        <span className={cn(styles.speaker, s.tag)}>{s.label}</span>
        <span className={styles.turnTime}>{formatDuration(t.offset_ms / 1000)}</span>
      </div>
      <p className={styles.bodyMd}>{t.text}</p>
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
      <div role="alert" className={styles.error}>
        {error.message}<Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }
  if (isLoading || !c) {
    return (
      <div className={styles.page} aria-busy="true">
        <Skeleton className={styles.skeletonHeader} />
        <div className={styles.skeletonGrid}>
          <Skeleton className={styles.skeletonMain} />
          <Skeleton className={styles.skeletonSide} />
        </div>
      </div>
    );
  }

  const qa = c.qa;
  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/calls" className={styles.crumbLink}>Call History</Link>
        <span aria-hidden>›</span>
        <span className={styles.crumbRef}>{c.call_ref}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroIntro}>
            <div className={styles.badges}>
              <Pill tone="info">{c.mode === "renewal" ? "Renewal call" : "Inbound query"}</Pill>
              {c.outcome && <Pill tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Pill>}
              {c.verified ? <Pill tone="success">Identity verified</Pill> : <Pill tone="warning">Not verified</Pill>}
              {c.is_simulated && <Pill tone="neutral">Seeded sample call</Pill>}
            </div>
            <h1 className={styles.title}>
              {c.customer?.full_name ?? "Unidentified caller"}{c.policy ? ` · ${c.policy.plan_name}` : ""}
            </h1>
            <div className={styles.facts}>
              {c.customer && <span>{c.customer.phone} · {c.customer.city}, {c.customer.state}</span>}
              {c.policy && <span>Policy <span className={styles.policyNo}>{c.policy.policy_no}</span></span>}
              {c.customer && <Link href={`/customers/${c.customer.id}`} className={styles.customerLink}>Open Customer 360</Link>}
            </div>
          </div>
          {back}
        </div>
        <div className={styles.metaGrid}>
          <Meta label="Started">{formatDateTime(c.started_at)}</Meta>
          <Meta label="Duration">{formatDuration(c.duration_sec)}</Meta>
          <Meta label="Handled by">{c.agent_name ? `AI, then ${c.agent_name}` : "AI agent"}</Meta>
          <Meta label="Taken over">{c.taken_over_at ? formatDateTime(c.taken_over_at) : "No"}</Meta>
          <Meta label="Sentiment">{c.sentiment ? <Pill tone={SENTIMENT_TONE[c.sentiment]}>{SENTIMENT_LABEL[c.sentiment]}</Pill> : "—"}</Meta>
        </div>
      </section>

      <div className={styles.columns}>
        <div className={styles.mainCol}>
          {(c.summary || c.next_action) && (
            <Card title="AI summary">
              <div className={styles.summary}>
                {c.summary && <p className={styles.bodyMd}>{c.summary}</p>}
                {c.next_action && (
                  <div className={styles.nextAction}>
                    <span className={styles.noteLabel}>Next action</span>
                    <p className={styles.bodySm}>{c.next_action}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
          <Card title="Transcript" action={<Pill tone="info">{c.turns.filter((t) => t.speaker !== "tool").length} turns</Pill>}>
            {c.turns.length === 0
              ? <p className={styles.muted}>No transcript: the customer didn&apos;t answer.</p>
              : <ol className={styles.turns}>{c.turns.map((t) => <TurnItem key={t.seq} t={t} />)}</ol>}
          </Card>
        </div>

        <div className={styles.sideCol}>
          <Card title="QA score" action={qa && <span className={styles.qaScore}>{qa.score} / 5</span>}>
            {qa ? (
              <div className={styles.qaBlock}>
                <ul className={styles.qaList}>
                  {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
                    <li key={k} className={styles.qaItem}>
                      {qa[k] ? <CircleCheck aria-label="Passed" className={styles.passIcon} /> : <CircleX aria-label="Failed" className={styles.failIcon} />}
                      <span className={qa[k] ? styles.passText : styles.failText}>{QA_LABEL[k]}</span>
                    </li>
                  ))}
                </ul>
                <span className={styles.scoredBy}>Scored by {qa.source === "human" ? "a QA analyst" : "AI"}</span>
              </div>
            ) : <p className={styles.muted}>Not scored. Calls without a conversation, or where automatic analysis failed, are left for a QA analyst.</p>}
          </Card>

          {c.policy && (
            <Card title="Policy">
              <dl className={styles.fields}>
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
              <ul className={styles.list}>
                {c.escalations.map((e) => (
                  <li key={e.id} className={styles.item}>
                    <div className={styles.itemHead}>
                      <Pill tone={PRIORITY_TONE[e.priority]}>{e.priority}</Pill>
                      <Pill tone={e.status === "resolved" ? "success" : "warning"}>{e.status}</Pill>
                    </div>
                    <p className={styles.bodySm}>{e.reason}</p>
                    {e.resolution_note && <p className={styles.muted}>Resolved{e.assigned_to_name ? ` by ${e.assigned_to_name}` : ""}: {e.resolution_note}</p>}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {c.followups.length > 0 && (
            <Card title="Follow-ups">
              <ul className={styles.list}>
                {c.followups.map((f) => (
                  <li key={f.id} className={styles.item}>
                    <div className={cn(styles.itemHead, styles.itemHeadSplit)}>
                      <span className={styles.followupKind}>{FOLLOWUP_KIND_LABEL[f.kind]}</span>
                      <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill>
                    </div>
                    <span className={styles.due}>Due {formatDateTime(f.due_at)}</span>
                    {f.message_text && <p className={styles.message}>{f.message_text}</p>}
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
