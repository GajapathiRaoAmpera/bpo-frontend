"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Hand, Inbox, Loader2, PhoneCall, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { PRIORITY_TONE } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMe } from "@/hooks/use-me";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime, formatINR, initials } from "@/lib/format";
import { LANGUAGE_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import styles from "./escalation-queue.module.scss";

type Row = Schemas["EscalationRow"];
type Tab = "active" | "resolved";
const PRIORITY_LABEL: Record<Schemas["Priority"], string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
const BAR: Record<Schemas["Priority"], string> = { urgent: styles.barUrgent, high: styles.barHigh, medium: styles.barMedium, low: styles.barLow };

function waited(since: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  if (mins < 48 * 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d`;
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={cn(styles.statValue, tone)}>{value}</span>
    </div>
  );
}

export function EscalationQueue() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const canAct = useLevel("escalations") === "full";
  const [tab, setTab] = useState<Tab>("active");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["escalations", tab],
    queryFn: () => unwrap(api.GET("/api/v1/escalations", { params: { query: { status: tab === "resolved" ? "resolved" : null } } })),
    refetchInterval: tab === "active" ? 15_000 : false,
  });
  const selected = data?.find((e) => e.id === selectedId) ?? data?.[0];

  const done = (msg: string) => async (row: Row) => {
    await queryClient.invalidateQueries({ queryKey: ["escalations"] });
    setSelectedId(row.status === "resolved" ? null : row.id);
    setNote("");
    toast.success(msg);
  };
  const claim = useMutation({
    mutationFn: (id: number) => unwrap(api.POST("/api/v1/escalations/{escalation_id}/claim", { params: { path: { escalation_id: id } } })),
    onSuccess: done("Escalation claimed. It's now assigned to you."),
    onError: (e) => toast.error(e.message),
  });
  const resolve = useMutation({
    mutationFn: (id: number) => unwrap(api.POST("/api/v1/escalations/{escalation_id}/resolve", { params: { path: { escalation_id: id } }, body: { note: note.trim() } })),
    onSuccess: done("Escalation resolved"),
    onError: (e) => toast.error(e.message),
  });

  function submitResolve() {
    if (note.trim().length < 3) return setNoteError("Add a short resolution note (at least 3 characters)");
    if (selected) resolve.mutate(selected.id);
  }

  const active = tab === "active" ? data ?? [] : [];
  const mine = selected?.assigned_to === me?.user.id;
  const takenByOther = selected?.assigned_to != null && !mine;
  const isLead = me?.user.role === "team_lead";

  return (
    <div className={styles.page}>
      <PageHeader
        title="Escalation Queue"
        badge={data && tab === "active" ? <Pill tone="danger" pulse>{data.length} waiting for a person</Pill> : undefined}
        description="Calls the AI handed to a person, most urgent and longest waiting first. Claim one, contact the customer, then resolve it with a note."
      />

      <div className={styles.statGrid}>
        <Stat label="Active" value={tab === "active" && data ? active.length : "—"} />
        <Stat label="Urgent" value={tab === "active" && data ? active.filter((e) => e.priority === "urgent").length : "—"} tone={styles.statUrgent} />
        <Stat label="Unclaimed" value={tab === "active" && data ? active.filter((e) => e.status === "open").length : "—"} />
        <Stat label="Assigned to me" value={tab === "active" && data ? active.filter((e) => e.assigned_to === me?.user.id).length : "—"} />
      </div>

      <div className={styles.layout}>
        <section aria-labelledby="queue-h" className={styles.queue}>
          <div className={styles.queueHeader}>
            <h2 id="queue-h" className={styles.sectionTitle}>Triage queue</h2>
            <div role="group" aria-label="Queue" className={styles.tabs}>
              {(["active", "resolved"] as const).map((t) => (
                <button key={t} type="button" aria-pressed={tab === t} onClick={() => { setTab(t); setSelectedId(null); }}
                  className={cn(styles.tab, tab === t && styles.tabActive)}>
                  {t === "active" ? "Open & assigned" : "Recently resolved"}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.queueList}>
            {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className={styles.itemSkeleton} />)}
            {error && (
              <div role="alert" className={styles.error}>
                {error.message}<Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
              </div>
            )}
            {data?.length === 0 && (
              <EmptyState icon={Inbox} title={tab === "active" ? "No one is waiting" : "Nothing resolved yet"}
                description={tab === "active" ? "When the AI hands a call to a person, it appears here." : "Resolved escalations appear here."} />
            )}
            {data?.map((e) => {
              const isSel = e.id === selected?.id;
              return (
                <button key={e.id} type="button" onClick={() => { setSelectedId(e.id); setNote(""); setNoteError(null); }} aria-pressed={isSel}
                  className={cn(styles.item, isSel && styles.itemSelected)}>
                  <span aria-hidden className={cn(styles.priorityBar, BAR[e.priority])} />
                  <div className={styles.itemHead}>
                    <span className={styles.sectionTitle}>{e.customer_name}</span>
                    <Pill tone={PRIORITY_TONE[e.priority]}>{PRIORITY_LABEL[e.priority]}</Pill>
                  </div>
                  <span className={styles.itemContact}>{e.phone} · {e.city}</span>
                  {e.policy_no && (
                    <div className={styles.itemPolicy}>
                      <span className={styles.policyChip}>{e.policy_no}</span>
                      <span className={styles.planName}>{e.plan_name}</span>
                    </div>
                  )}
                  <p className={styles.itemReason}>{e.reason}</p>
                  <div className={styles.itemFoot}>
                    <Pill tone="lang">{LANGUAGE_LABEL[e.preferred_language]}</Pill>
                    <span className={styles.itemMeta}>
                      {e.status === "resolved" ? <><CheckCircle2 aria-hidden className={cn(styles.smallIcon, styles.resolvedIcon)} />Resolved {e.resolved_at && formatDateTime(e.resolved_at)}</>
                        : <><Clock aria-hidden className={styles.smallIcon} />{e.assigned_to_name ? `${e.assigned_to_name} · ` : "Unclaimed · "}waiting {waited(e.created_at)}</>}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className={styles.detail}>
          {!selected ? (
            !isLoading && <EmptyState icon={Hand} title="Select an escalation" description="Pick a customer from the queue to see the AI's hand-off context." />
          ) : <>
            <section className={styles.card}>
              <div className={styles.detailHead}>
                <div className={styles.identity}>
                  <span aria-hidden className={styles.avatar}>{initials(selected.customer_name)}</span>
                  <div className={styles.identityText}>
                    <h2 className={styles.customerName}>{selected.customer_name}</h2>
                    <span className={styles.customerContact}>{selected.phone} · {selected.city}</span>
                  </div>
                </div>
                <div className={styles.detailPills}>
                  <Pill tone={PRIORITY_TONE[selected.priority]}>{PRIORITY_LABEL[selected.priority]} priority</Pill>
                  <Pill tone={selected.status === "resolved" ? "success" : selected.status === "assigned" ? "info" : "warning"}>
                    {selected.status === "open" ? "Unclaimed" : selected.status === "assigned" ? `Assigned to ${selected.assigned_to_name}` : "Resolved"}
                  </Pill>
                </div>
              </div>
              <dl className={styles.facts}>
                {[
                  ["Policy", selected.policy_no ?? "—"],
                  ["Premium", selected.premium_inr === null ? "—" : formatINR(selected.premium_inr)],
                  ["Escalated", formatDateTime(selected.created_at)],
                  ["Language", LANGUAGE_LABEL[selected.preferred_language]],
                ].map(([k, v]) => (
                  <div key={k} className={styles.fact}>
                    <dt className={styles.label}>{k}</dt>
                    <dd className={styles.factValue}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.handoff}>
                <span className={styles.handoffLabel}>Reason for hand-off: </span>{selected.reason}
              </div>
              <div className={styles.links}>
                <Button asChild variant="outline"><Link href={`/customers/${selected.customer_id}`}>Open Customer 360</Link></Button>
                {selected.call_id && <Button asChild variant="outline"><Link href={`/calls/${selected.call_id}`}><PhoneCall aria-hidden />Open call {selected.call_ref}</Link></Button>}
              </div>
            </section>

            <section className={cn(styles.card, styles.cardCompact)}>
              <h2 className={styles.briefTitle}><Sparkles aria-hidden className={styles.briefIcon} />AI context brief</h2>
              <p className={styles.bodyText}>{selected.call_summary ?? "No call summary is available for this escalation."}</p>
            </section>

            {selected.status === "resolved" ? (
              <section className={cn(styles.card, styles.cardCompact)}>
                <h2 className={styles.sectionTitle}>Resolution</h2>
                <p className={styles.bodyText}>{selected.resolution_note}</p>
                <span className={styles.resolvedBy}>{selected.assigned_to_name} · {selected.resolved_at && formatDateTime(selected.resolved_at)}</span>
              </section>
            ) : canAct ? (
              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Handle this escalation</h2>
                {takenByOther && !isLead ? (
                  <p className={styles.handledElsewhere}>{selected.assigned_to_name} is handling this escalation.</p>
                ) : <>
                  {selected.status === "open" && (
                    <Button className={styles.inlineAction} onClick={() => claim.mutate(selected.id)} disabled={claim.isPending}>
                      {claim.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Hand aria-hidden />}
                      {claim.isPending ? "Claiming…" : "Claim escalation"}
                    </Button>
                  )}
                  <div className={styles.noteField}>
                    <Label htmlFor="resolution" className={styles.noteLabel}>Resolution note</Label>
                    <Textarea id="resolution" rows={3} value={note} aria-invalid={!!noteError} aria-describedby={noteError ? "resolution-error" : undefined}
                      onChange={(e) => { setNote(e.target.value); setNoteError(null); }}
                      onBlur={() => note && note.trim().length < 3 && setNoteError("Add a short resolution note (at least 3 characters)")}
                      placeholder="What you did for the customer" />
                    {noteError && <p id="resolution-error" className={styles.noteError}>{noteError}</p>}
                  </div>
                  <Button variant="secondary" className={styles.inlineAction} onClick={submitResolve} disabled={resolve.isPending}>
                    {resolve.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <CheckCircle2 aria-hidden />}
                    {resolve.isPending ? "Resolving…" : "Resolve escalation"}
                  </Button>
                </>}
              </section>
            ) : (
              <p className={styles.viewOnly}>View only: team leads and human agents claim and resolve escalations.</p>
            )}
          </>}
        </div>
      </div>
    </div>
  );
}
