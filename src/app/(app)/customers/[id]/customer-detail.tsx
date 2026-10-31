"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarPlus, MessageCircle, ShieldAlert, UserX } from "lucide-react";
import Link from "next/link";
import { use } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Pill, type PillTone } from "@/components/common/pill";
import { FollowupDialog } from "@/components/ops/followup-dialog";
import { FOLLOWUP_KIND_LABEL, FOLLOWUP_STATUS_LABEL, FOLLOWUP_TONE, OUTCOME_TONE } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, ApiError, type Schemas, unwrap } from "@/lib/api";
import { formatDate, formatDateTime, formatINR, initials } from "@/lib/format";
import { formatDuration, LANGUAGE_LABEL, OUTCOME_LABEL, PRODUCT_LABEL } from "@/lib/labels";

import styles from "./customer-detail.module.scss";

const POLICY_TONE: Record<Schemas["PolicyStatus"], PillTone> = { active: "success", due: "warning", lapsed: "danger", renewed: "info" };
const POLICY_LABEL: Record<Schemas["PolicyStatus"], string> = { active: "Active", due: "Renewal due", lapsed: "Lapsed", renewed: "Renewed" };

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
      <dt className={styles.metaLabel}>{label}</dt>
      <dd className={styles.metaValue}>{children}</dd>
    </div>
  );
}

export function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customerId = Number(id);
  const canFollowUp = useLevel("followups") === "full";
  const callsLevel = useLevel("calls");
  const { data: c, isLoading, error, refetch } = useQuery({
    queryKey: ["customers", "detail", customerId],
    queryFn: () => unwrap(api.GET("/api/v1/customers/{customer_id}", { params: { path: { customer_id: customerId } } })),
    enabled: Number.isInteger(customerId),
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
  });

  const back = <Button asChild variant="outline"><Link href="/customers"><ArrowLeft aria-hidden />Back to customers</Link></Button>;
  if (!Number.isInteger(customerId) || (error instanceof ApiError && error.status === 404)) {
    return <EmptyState icon={UserX} title="Customer not found" description="This customer record doesn't exist." action={back} />;
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
        <Skeleton className={styles.skeletonBody} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.identity}>
            <span aria-hidden className={styles.avatar}>{initials(c.full_name)}</span>
            <div className={styles.identityText}>
              <div className={styles.nameRow}>
                <h1 className={styles.title}>{c.full_name}</h1>
                {c.masked && <Pill tone="warning"><ShieldAlert aria-hidden className={styles.badgeIcon} />Masked view</Pill>}
              </div>
              <span className={styles.subtitle}>{c.customer_code} · {c.city}, {c.state}</span>
            </div>
          </div>
          {back}
        </div>
        <dl className={styles.metaGrid}>
          <Meta label="Mobile">{c.phone}</Meta>
          <Meta label="Email">{c.email}</Meta>
          <Meta label="Date of birth">{c.dob ? formatDate(c.dob) : "Hidden for your role"}</Meta>
          <Meta label="Language"><Pill tone="lang">{LANGUAGE_LABEL[c.preferred_language]}</Pill></Meta>
        </dl>
      </section>

      <Card title="Policies" action={<Pill tone="info">{c.policies.length}</Pill>}>
        <div className={styles.policies}>
          {c.policies.map((p) => (
            <div key={p.id} className={styles.policy}>
              <div className={styles.policyHead}>
                <div className={styles.stack}>
                  <span className={styles.planName}>{p.plan_name}</span>
                  <span className={styles.policyNo}>{p.policy_no}</span>
                </div>
                <Pill tone={POLICY_TONE[p.status]}>{POLICY_LABEL[p.status]}</Pill>
              </div>
              <dl className={styles.policyMeta}>
                <Meta label="Product">{PRODUCT_LABEL[p.product]}</Meta>
                <Meta label="Premium">{formatINR(p.premium_inr)}</Meta>
                <Meta label="Sum insured">{formatINR(p.sum_insured_inr)}</Meta>
                <Meta label="Renewal">{formatDate(p.renewal_date)}</Meta>
                {p.vehicle_reg && <Meta label="Vehicle">{p.vehicle_reg}</Meta>}
              </dl>
              {canFollowUp && (
                <FollowupDialog policyNo={p.policy_no} policyId={p.id}
                  trigger={<Button size="sm" variant="outline" className={styles.followupButton}><CalendarPlus aria-hidden />Schedule follow-up</Button>} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className={styles.columns}>
        <div className={styles.callsCol}>
          <Card title="Recent calls" action={<Pill tone="info">{c.calls.length}</Pill>}>
            {c.calls.length === 0 ? (
              <p className={styles.muted}>{callsLevel ? (callsLevel === "own" ? "You haven't handled a call with this customer." : "No calls with this customer yet.") : "Call history isn't part of your role."}</p>
            ) : (
              <ul className={styles.calls}>
                {c.calls.map((call) => (
                  <li key={call.id}>
                    <Link href={`/calls/${call.id}`} className={styles.callLink}>
                      <div className={styles.stack}>
                        <span className={styles.callRef}>{call.call_ref}</span>
                        <span className={styles.callMeta}>{formatDateTime(call.started_at)} · {call.mode === "renewal" ? "Renewal" : "Inbound"} · {formatDuration(call.duration_sec)}</span>
                      </div>
                      {call.outcome && <Pill tone={OUTCOME_TONE[call.outcome]}>{OUTCOME_LABEL[call.outcome]}</Pill>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className={styles.followupsCol}>
          <Card title="Follow-ups" action={<Pill tone="info">{c.followups.length}</Pill>}>
            {c.followups.length === 0 ? (
              <p className={styles.muted}>No payment links, callbacks or reminders for this customer.</p>
            ) : (
              <ul className={styles.list}>
                {c.followups.map((f) => (
                  <li key={f.id} className={styles.item}>
                    <div className={styles.itemHead}>
                      <span className={styles.followupKind}>{FOLLOWUP_KIND_LABEL[f.kind]} · <span className={styles.followupPolicy}>{f.policy_no}</span></span>
                      <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill>
                    </div>
                    <span className={styles.due}>Due {formatDateTime(f.due_at)}</span>
                    {f.message_text && (
                      <p className={styles.message}>
                        <MessageCircle aria-hidden className={styles.messageIcon} />{f.message_text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
