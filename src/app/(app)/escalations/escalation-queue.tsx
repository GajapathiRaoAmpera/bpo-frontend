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

type Row = Schemas["EscalationRow"];
type Tab = "active" | "resolved";
const PRIORITY_LABEL: Record<Schemas["Priority"], string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
const BAR: Record<Schemas["Priority"], string> = { urgent: "bg-error", high: "bg-warning", medium: "bg-primary-container", low: "bg-outline-variant" };

function waited(since: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(since).getTime()) / 60_000));
  if (mins < 60) return `${mins}m`;
  if (mins < 48 * 60) return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  return `${Math.floor(mins / 1440)}d`;
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg bg-surface-container-lowest p-space-md shadow-card">
      <span className="text-label-xs tracking-wider text-outline uppercase">{label}</span>
      <span className={cn("text-display text-primary", tone)}>{value}</span>
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
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Escalation Queue"
        badge={data && tab === "active" ? <Pill tone="danger" pulse>{data.length} waiting for a person</Pill> : undefined}
        description="Calls the AI handed to a person, most urgent and longest waiting first. Claim one, contact the customer, then resolve it with a note."
      />

      <div className="grid grid-cols-2 gap-space-md lg:grid-cols-4">
        <Stat label="Active" value={tab === "active" && data ? active.length : "—"} />
        <Stat label="Urgent" value={tab === "active" && data ? active.filter((e) => e.priority === "urgent").length : "—"} tone="text-error" />
        <Stat label="Unclaimed" value={tab === "active" && data ? active.filter((e) => e.status === "open").length : "—"} />
        <Stat label="Assigned to me" value={tab === "active" && data ? active.filter((e) => e.assigned_to === me?.user.id).length : "—"} />
      </div>

      <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
        <section aria-labelledby="queue-h" className="flex flex-col gap-space-md lg:col-span-5">
          <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-card">
            <h2 id="queue-h" className="text-headline-sm text-on-surface">Triage queue</h2>
            <div role="group" aria-label="Queue" className="flex gap-1 text-label-xs">
              {(["active", "resolved"] as const).map((t) => (
                <button key={t} type="button" aria-pressed={tab === t} onClick={() => { setTab(t); setSelectedId(null); }}
                  className={cn("rounded-lg px-2.5 py-1.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-lang-border",
                    tab === t ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high")}>
                  {t === "active" ? "Open & assigned" : "Recently resolved"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex max-h-[calc(100vh-22rem)] min-h-64 flex-col gap-space-sm overflow-y-auto pr-1">
            {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-lg bg-surface-container-lowest" />)}
            {error && (
              <div role="alert" className="flex flex-col items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
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
                  className={cn("relative flex shrink-0 flex-col gap-space-xs overflow-hidden rounded-lg bg-surface-container-lowest p-space-md pl-space-lg text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border",
                    isSel ? "border-2 border-primary shadow-popover" : "border border-divider shadow-card hover:border-neutral-border")}>
                  <span aria-hidden className={cn("absolute inset-y-0 left-0 w-1.5", BAR[e.priority])} />
                  <div className="flex items-start justify-between gap-space-sm">
                    <span className="text-headline-sm text-on-surface">{e.customer_name}</span>
                    <Pill tone={PRIORITY_TONE[e.priority]}>{PRIORITY_LABEL[e.priority]}</Pill>
                  </div>
                  <span className="text-data-mono text-label-xs text-on-surface-variant">{e.phone} · {e.city}</span>
                  {e.policy_no && (
                    <div className="flex items-center gap-space-sm text-label-xs">
                      <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-data-mono text-[11px] text-primary">{e.policy_no}</span>
                      <span className="truncate text-on-surface-variant">{e.plan_name}</span>
                    </div>
                  )}
                  <p className="line-clamp-2 text-body-sm text-on-surface">{e.reason}</p>
                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-space-xs text-label-xs font-medium text-on-surface-variant">
                    <Pill tone="lang">{LANGUAGE_LABEL[e.preferred_language]}</Pill>
                    <span className="flex items-center gap-1">
                      {e.status === "resolved" ? <><CheckCircle2 aria-hidden className="size-3.5 text-success" />Resolved {e.resolved_at && formatDateTime(e.resolved_at)}</>
                        : <><Clock aria-hidden className="size-3.5" />{e.assigned_to_name ? `${e.assigned_to_name} · ` : "Unclaimed · "}waiting {waited(e.created_at)}</>}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-space-xl lg:col-span-7">
          {!selected ? (
            !isLoading && <EmptyState icon={Hand} title="Select an escalation" description="Pick a customer from the queue to see the AI's hand-off context." />
          ) : <>
            <section className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-space-md">
                <div className="flex items-center gap-space-md">
                  <span aria-hidden className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-headline-sm text-primary">{initials(selected.customer_name)}</span>
                  <div className="flex flex-col">
                    <h2 className="text-headline-lg text-on-surface">{selected.customer_name}</h2>
                    <span className="text-data-mono text-label-sm text-on-surface-variant">{selected.phone} · {selected.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm">
                  <Pill tone={PRIORITY_TONE[selected.priority]}>{PRIORITY_LABEL[selected.priority]} priority</Pill>
                  <Pill tone={selected.status === "resolved" ? "success" : selected.status === "assigned" ? "info" : "warning"}>
                    {selected.status === "open" ? "Unclaimed" : selected.status === "assigned" ? `Assigned to ${selected.assigned_to_name}` : "Resolved"}
                  </Pill>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-space-md border-t border-divider pt-space-md md:grid-cols-4">
                {[
                  ["Policy", selected.policy_no ?? "—"],
                  ["Premium", selected.premium_inr === null ? "—" : formatINR(selected.premium_inr)],
                  ["Escalated", formatDateTime(selected.created_at)],
                  ["Language", LANGUAGE_LABEL[selected.preferred_language]],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <dt className="text-label-xs tracking-wider text-outline uppercase">{k}</dt>
                    <dd className="text-label-md text-on-surface">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="rounded-lg border border-warning-border bg-warning-bg p-space-md text-body-sm text-warning-text">
                <span className="font-semibold">Reason for hand-off: </span>{selected.reason}
              </div>
              <div className="flex flex-wrap gap-space-sm">
                <Button asChild variant="outline"><Link href={`/customers/${selected.customer_id}`}>Open Customer 360</Link></Button>
                {selected.call_id && <Button asChild variant="outline"><Link href={`/calls/${selected.call_id}`}><PhoneCall aria-hidden />Open call {selected.call_ref}</Link></Button>}
              </div>
            </section>

            <section className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
              <h2 className="flex items-center gap-space-sm text-headline-sm text-on-surface"><Sparkles aria-hidden className="size-4 text-secondary" />AI context brief</h2>
              <p className="text-body-md text-on-surface">{selected.call_summary ?? "No call summary is available for this escalation."}</p>
            </section>

            {selected.status === "resolved" ? (
              <section className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
                <h2 className="text-headline-sm text-on-surface">Resolution</h2>
                <p className="text-body-md text-on-surface">{selected.resolution_note}</p>
                <span className="text-label-sm text-on-surface-variant">{selected.assigned_to_name} · {selected.resolved_at && formatDateTime(selected.resolved_at)}</span>
              </section>
            ) : canAct ? (
              <section className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
                <h2 className="text-headline-sm text-on-surface">Handle this escalation</h2>
                {takenByOther && !isLead ? (
                  <p className="text-body-sm text-on-surface-variant">{selected.assigned_to_name} is handling this escalation.</p>
                ) : <>
                  {selected.status === "open" && (
                    <Button className="self-start" onClick={() => claim.mutate(selected.id)} disabled={claim.isPending}>
                      {claim.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Hand aria-hidden />}
                      {claim.isPending ? "Claiming…" : "Claim escalation"}
                    </Button>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="resolution" className="text-label-md text-on-surface">Resolution note</Label>
                    <Textarea id="resolution" rows={3} value={note} aria-invalid={!!noteError} aria-describedby={noteError ? "resolution-error" : undefined}
                      onChange={(e) => { setNote(e.target.value); setNoteError(null); }}
                      onBlur={() => note && note.trim().length < 3 && setNoteError("Add a short resolution note (at least 3 characters)")}
                      placeholder="What you did for the customer" />
                    {noteError && <p id="resolution-error" className="text-label-sm text-danger-text">{noteError}</p>}
                  </div>
                  <Button variant="secondary" className="self-start" onClick={submitResolve} disabled={resolve.isPending}>
                    {resolve.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <CheckCircle2 aria-hidden />}
                    {resolve.isPending ? "Resolving…" : "Resolve escalation"}
                  </Button>
                </>}
              </section>
            ) : (
              <p className="rounded-lg bg-surface-container-low p-space-md text-body-sm text-on-surface-variant">View only: team leads and human agents claim and resolve escalations.</p>
            )}
          </>}
        </div>
      </div>
    </div>
  );
}
