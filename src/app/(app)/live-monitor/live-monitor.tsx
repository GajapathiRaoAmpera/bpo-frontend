"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Bot, Eye, Headset, PhoneCall, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { SCREEN_HREF } from "@/lib/routes";
import { formatDuration, SENTIMENT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type LiveCall = Schemas["LiveCallRow"];

const SENTIMENT_TONE = { positive: "success", neutral: "neutral", negative: "danger" } as const;
const SPEAKER = { bot: "AI", customer: "Customer", agent: "Agent", tool: "Tool" } as const;

function useNow() {
  // Starts at 0 so the prerender doesn't read the clock; the first tick sets it.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

function status(call: LiveCall) {
  if (call.taken_over) return <Pill tone="warning"><Headset aria-hidden className="size-3" /> Human on call</Pill>;
  if (call.bot_connected) return <Pill tone="live" pulse>AI on call</Pill>;
  return <Pill tone="neutral">Connecting</Pill>;
}

function Kpi({ label, value, icon: Icon, note }: { label: string; value: number; icon: typeof Activity; note: string }) {
  return (
    <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">{label}</span>
        <span className="flex size-7 items-center justify-center rounded-lg bg-surface-container-low text-primary"><Icon aria-hidden className="size-4" /></span>
      </div>
      <span className="text-display text-on-surface">{value}</span>
      <span className="text-label-sm text-outline">{note}</span>
    </div>
  );
}

function CallCard({ call, now, selected, onOpen }: { call: LiveCall; now: number; selected: boolean; onOpen?: () => void }) {
  const elapsed = now ? Math.max(0, (now - new Date(call.started_at).getTime()) / 1000) : 0;
  return (
    <li className={cn("flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card",
      selected ? "border-2 border-primary" : "border border-divider")}>
      <div className="flex flex-wrap items-center gap-space-sm">
        <span className={cn("size-2 rounded-full", call.taken_over ? "bg-warning-text" : "bg-secondary")} aria-hidden />
        <span className="text-headline-sm text-on-surface">{call.customer_name ?? "Unidentified caller"}</span>
        {call.customer_phone && <span className="text-data-mono text-on-surface-variant">{call.customer_phone}</span>}
        <span className="ml-auto flex items-center gap-space-sm">
          {status(call)}
          <Pill tone="info">In call · {formatDuration(Math.max(0, elapsed))}</Pill>
        </span>
      </div>
      <dl className="grid grid-cols-3 gap-space-md rounded-lg bg-surface-container-low/60 p-space-md text-body-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">Call</dt>
          <dd className="text-data-mono text-on-surface">{call.call_ref}</dd>
          <dd className="text-on-surface-variant">{call.mode === "renewal" ? "Renewal" : "Inbound"}{call.policy_no ? ` · ${call.policy_no}` : ""}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">Agent desk</dt>
          <dd className="text-on-surface">{call.agent_name ?? "AI only"}</dd>
          <dd className="text-on-surface-variant">Started {formatTime(call.started_at)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">Verification · sentiment</dt>
          <dd>{call.verified ? <Pill tone="success"><ShieldCheck aria-hidden className="size-3" /> Verified</Pill> : <Pill tone="neutral">Not verified yet</Pill>}</dd>
          <dd>{call.sentiment
            ? <Pill tone={SENTIMENT_TONE[call.sentiment]}>{SENTIMENT_LABEL[call.sentiment]}</Pill>
            : <span className="text-on-surface-variant">Sentiment scored after the call</span>}</dd>
        </div>
      </dl>
      <div className="flex items-center gap-space-md">
        <p className="min-w-0 flex-1 truncate text-body-sm text-on-surface-variant">
          {call.last_text
            ? <><span className="font-semibold text-primary">{SPEAKER[call.last_speaker ?? "bot"]}:</span> {call.last_text}</>
            : "Waiting for the first words on the call."}
        </p>
        {onOpen && (
          <Button size="sm" variant="outline" onClick={onOpen} aria-pressed={selected}>
            <Eye aria-hidden /> Open call
          </Button>
        )}
      </div>
    </li>
  );
}

function CallPanel({ callId, onClose }: { callId: number; onClose: () => void }) {
  const { data, error } = useQuery({
    queryKey: ["voice", "session", callId],
    queryFn: () => unwrap(api.GET("/api/v1/voice/sessions/{call_id}", { params: { path: { call_id: callId } } })),
    refetchInterval: (q) => (q.state.data?.ended_at ? false : 2000),
  });
  const turns = data?.turns.filter((t) => t.speaker !== "tool").slice(-12) ?? [];
  return (
    <aside aria-label="Call detail" className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
      <div className="flex items-center justify-between gap-space-sm">
        <h2 className="text-headline-sm text-on-surface">{data?.call_ref ?? "Loading call…"}</h2>
        <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close call detail"><X aria-hidden /></Button>
      </div>
      {error && <p role="alert" className="text-body-sm text-danger-text">{error.message}</p>}
      {data && (
        <>
          <div className="flex flex-wrap gap-space-sm">
            {data.ended_at ? <Pill tone="neutral">Call ended</Pill> : data.taken_over ? <Pill tone="warning">Taken over by agent</Pill> : <Pill tone="live" pulse>AI handling</Pill>}
            {data.customer && <Pill tone="info"><UserRound aria-hidden className="size-3" /> {data.customer.full_name}</Pill>}
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Takeover is done by the agent who started the call, from their Agent Console. This view follows the transcript live.
          </p>
          <ol className="flex max-h-[28rem] flex-col gap-space-sm overflow-y-auto">
            {turns.length === 0 && <li className="text-body-sm text-on-surface-variant">No transcript yet.</li>}
            {turns.map((t) => (
              <li key={t.seq} className="rounded-lg border border-divider p-space-sm">
                <span className="flex items-center gap-1 text-label-sm font-semibold text-primary">
                  {t.speaker === "bot" ? <Bot aria-hidden className="size-3" /> : t.speaker === "agent" ? <Headset aria-hidden className="size-3" /> : <UserRound aria-hidden className="size-3" />}
                  {SPEAKER[t.speaker]} · <span className="text-data-mono font-normal text-outline">{formatDuration(t.offset_ms / 1000)}</span>
                </span>
                <p className="text-body-sm text-on-surface">{t.text}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  );
}

export function LiveMonitor() {
  const { data: me } = useMe();
  const canOpen = me?.nav.find((n) => n.screen === "live_monitor")?.level === "full";
  const canConsole = me?.nav.some((n) => n.screen === "agent_console");
  const [openId, setOpenId] = useState<number | null>(null);
  const now = useNow();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["live", "calls"],
    queryFn: () => unwrap(api.GET("/api/v1/live/calls")),
    refetchInterval: 5000,
  });
  const calls = data ?? [];

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Live Monitor"
        badge={<Pill tone="live" pulse>Live · every 5 s</Pill>}
        description={canOpen
          ? "Every call in progress on the floor. Open a call to follow its transcript and takeover status."
          : "Every call in progress on the floor. View only for your role."}
      />

      <div className="grid grid-cols-2 gap-space-lg lg:grid-cols-4">
        <Kpi label="Active calls" value={calls.length} icon={PhoneCall} note="In progress right now" />
        <Kpi label="AI handling" value={calls.filter((c) => c.bot_connected && !c.taken_over).length} icon={Bot} note="Voice agent connected" />
        <Kpi label="Human on call" value={calls.filter((c) => c.taken_over).length} icon={Headset} note="Taken over by an agent" />
        <Kpi label="Verified callers" value={calls.filter((c) => c.verified).length} icon={ShieldCheck} note="Identity check passed" />
      </div>

      <div className="grid grid-cols-1 gap-space-xl xl:grid-cols-12">
        <section aria-label="Calls in progress" className={cn("flex flex-col gap-space-md", openId ? "xl:col-span-8" : "xl:col-span-12")}>
          {isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-44 rounded-lg bg-surface-container-lowest" />)}
          {error && (
            <div role="alert" className="flex flex-col items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
              {error.message}
              <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          )}
          {data?.length === 0 && (
            <EmptyState icon={Activity} title="No calls in progress"
              description="Calls appear here as soon as an agent starts one from the Agent Console. This page refreshes every 5 seconds."
              action={canConsole ? <Button asChild><Link href={SCREEN_HREF.agent_console}>Open Agent Console</Link></Button> : undefined} />
          )}
          {calls.length > 0 && (
            <ul className="flex flex-col gap-space-md">
              {calls.map((c) => (
                <CallCard key={c.call_id} call={c} now={now} selected={c.call_id === openId}
                  onOpen={canOpen ? () => setOpenId(c.call_id) : undefined} />
              ))}
            </ul>
          )}
        </section>
        {openId && canOpen && (
          <div className="xl:col-span-4"><CallPanel callId={openId} onClose={() => setOpenId(null)} /></div>
        )}
      </div>
    </div>
  );
}
