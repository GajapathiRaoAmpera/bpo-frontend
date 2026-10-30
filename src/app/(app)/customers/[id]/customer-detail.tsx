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

const POLICY_TONE: Record<Schemas["PolicyStatus"], PillTone> = { active: "success", due: "warning", lapsed: "danger", renewed: "info" };
const POLICY_LABEL: Record<Schemas["PolicyStatus"], string> = { active: "Active", due: "Renewal due", lapsed: "Lapsed", renewed: "Renewed" };

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
      <dt className="text-label-xs tracking-wider text-outline uppercase">{label}</dt>
      <dd className="text-data-mono text-on-surface">{children}</dd>
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
      <div role="alert" className="flex items-center justify-between rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
        {error.message}<Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }
  if (isLoading || !c) {
    return (
      <div className="flex flex-col gap-space-xl" aria-busy="true">
        <Skeleton className="h-40 rounded-lg bg-surface-container-lowest" />
        <Skeleton className="h-64 rounded-lg bg-surface-container-lowest" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <section className="flex flex-col gap-space-lg rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-surface-container-high text-headline-md text-primary">{initials(c.full_name)}</span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-sm">
                <h1 className="text-headline-lg text-on-surface">{c.full_name}</h1>
                {c.masked && <Pill tone="warning"><ShieldAlert aria-hidden className="size-3" />Masked view</Pill>}
              </div>
              <span className="text-data-mono text-label-sm text-on-surface-variant">{c.customer_code} · {c.city}, {c.state}</span>
            </div>
          </div>
          {back}
        </div>
        <dl className="grid grid-cols-2 gap-space-md border-t border-divider pt-space-md md:grid-cols-4">
          <Meta label="Mobile">{c.phone}</Meta>
          <Meta label="Email">{c.email}</Meta>
          <Meta label="Date of birth">{c.dob ? formatDate(c.dob) : "Hidden for your role"}</Meta>
          <Meta label="Language"><Pill tone="lang">{LANGUAGE_LABEL[c.preferred_language]}</Pill></Meta>
        </dl>
      </section>

      <Card title="Policies" action={<Pill tone="info">{c.policies.length}</Pill>}>
        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 xl:grid-cols-3">
          {c.policies.map((p) => (
            <div key={p.id} className="flex flex-col gap-space-sm rounded-lg border border-divider p-space-md">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="flex flex-col">
                  <span className="text-label-md text-on-surface">{p.plan_name}</span>
                  <span className="text-data-mono text-label-xs text-primary">{p.policy_no}</span>
                </div>
                <Pill tone={POLICY_TONE[p.status]}>{POLICY_LABEL[p.status]}</Pill>
              </div>
              <dl className="grid grid-cols-2 gap-space-sm">
                <Meta label="Product">{PRODUCT_LABEL[p.product]}</Meta>
                <Meta label="Premium">{formatINR(p.premium_inr)}</Meta>
                <Meta label="Sum insured">{formatINR(p.sum_insured_inr)}</Meta>
                <Meta label="Renewal">{formatDate(p.renewal_date)}</Meta>
                {p.vehicle_reg && <Meta label="Vehicle">{p.vehicle_reg}</Meta>}
              </dl>
              {canFollowUp && (
                <FollowupDialog policyNo={p.policy_no} policyId={p.id}
                  trigger={<Button size="sm" variant="outline" className="self-start"><CalendarPlus aria-hidden />Schedule follow-up</Button>} />
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card title="Recent calls" action={<Pill tone="info">{c.calls.length}</Pill>}>
            {c.calls.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">{callsLevel ? (callsLevel === "own" ? "You haven't handled a call with this customer." : "No calls with this customer yet.") : "Call history isn't part of your role."}</p>
            ) : (
              <ul className="divide-y divide-divider">
                {c.calls.map((call) => (
                  <li key={call.id}>
                    <Link href={`/calls/${call.id}`} className="flex items-center justify-between gap-space-md rounded-sm py-space-sm hover:bg-table-head focus-visible:outline-2 focus-visible:outline-lang-border">
                      <div className="flex flex-col">
                        <span className="text-data-mono text-primary">{call.call_ref}</span>
                        <span className="text-label-xs font-medium text-on-surface-variant">{formatDateTime(call.started_at)} · {call.mode === "renewal" ? "Renewal" : "Inbound"} · {formatDuration(call.duration_sec)}</span>
                      </div>
                      {call.outcome && <Pill tone={OUTCOME_TONE[call.outcome]}>{OUTCOME_LABEL[call.outcome]}</Pill>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card title="Follow-ups" action={<Pill tone="info">{c.followups.length}</Pill>}>
            {c.followups.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No payment links, callbacks or reminders for this customer.</p>
            ) : (
              <ul className="flex flex-col gap-space-md">
                {c.followups.map((f) => (
                  <li key={f.id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="text-label-md text-on-surface">{FOLLOWUP_KIND_LABEL[f.kind]} · <span className="text-data-mono text-label-xs text-on-surface-variant">{f.policy_no}</span></span>
                      <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill>
                    </div>
                    <span className="text-label-xs font-medium text-on-surface-variant">Due {formatDateTime(f.due_at)}</span>
                    {f.message_text && (
                      <p className="flex items-start gap-1.5 rounded-lg bg-success-bg p-space-sm text-body-sm text-on-surface">
                        <MessageCircle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />{f.message_text}
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
