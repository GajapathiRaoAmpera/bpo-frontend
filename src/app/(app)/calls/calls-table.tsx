"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Bot, History, Search, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { DataTable, type Features } from "@/components/ops/data-table";
import { OUTCOME_TONE, SENTIMENT_TONE } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL, SENTIMENT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Row = Schemas["CallRow"];
const h = createColumnHelper<Features, Row>();
const columns = h.columns([
  h.display({ id: "ref", header: "Call", cell: ({ row: { original: c } }) => (
    <div className="flex flex-col">
      <span className="text-data-mono text-primary">{c.call_ref}</span>
      <span className="text-label-xs font-medium text-on-surface-variant">{formatDateTime(c.started_at)}</span>
    </div>
  ) }),
  h.display({ id: "customer", header: "Customer", cell: ({ row: { original: c } }) => (
    <div className="flex flex-col">
      <span className="text-label-md">{c.customer_name ?? "Unidentified caller"}</span>
      <span className="text-data-mono text-label-xs text-on-surface-variant">{c.policy_no ?? "—"}</span>
    </div>
  ) }),
  h.display({ id: "mode", header: "Type", cell: ({ row: { original: c } }) => (c.mode === "renewal" ? "Renewal · outbound" : "Inbound query") }),
  h.display({ id: "handled", header: "Handled by", cell: ({ row: { original: c } }) => (
    <span className="flex items-center gap-1.5">
      {c.agent_name ? <UserRound aria-hidden className="size-3.5 text-outline" /> : <Bot aria-hidden className="size-3.5 text-secondary" />}
      {c.agent_name ? `AI + ${c.agent_name}` : "AI agent"}
    </span>
  ) }),
  h.display({ id: "outcome", header: "Outcome", cell: ({ row: { original: c } }) => (c.outcome
    ? <Pill tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Pill> : <Pill tone="live" pulse>In progress</Pill>) }),
  h.display({ id: "sentiment", header: "Sentiment", cell: ({ row: { original: c } }) => (c.sentiment
    ? <Pill tone={SENTIMENT_TONE[c.sentiment]}>{SENTIMENT_LABEL[c.sentiment]}</Pill> : "—") }),
  h.display({ id: "qa", header: "QA", cell: ({ row: { original: c } }) => <span className="text-data-mono">{c.qa_score === null ? "—" : `${c.qa_score}/5`}</span> }),
  h.display({ id: "duration", header: "Duration", cell: ({ row: { original: c } }) => <span className="text-data-mono">{formatDuration(c.duration_sec)}</span> }),
]);

const OUTCOMES = Object.keys(OUTCOME_LABEL) as Schemas["CallOutcome"][];
const PAGE_SIZE = 25;

export function CallsTable() {
  const router = useRouter();
  const own = useLevel("calls") === "own";
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<Schemas["CallOutcome"] | null>(null);
  const [page, setPage] = useState(1);
  const query = useDeferredValue(q.trim());

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["calls", { query, outcome, page }],
    queryFn: () => unwrap(api.GET("/api/v1/calls", { params: { query: { q: query || null, outcome, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Call History"
        badge={own ? <Pill tone="info">Your calls</Pill> : undefined}
        description={own
          ? "Calls you handled or took over, with outcome, sentiment, AI summary, transcript and QA score."
          : "Every call with outcome, sentiment, AI summary, transcript and QA score. Open a call to read the transcript."}
      />
      <div className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-card">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="calls-q" className="text-label-md text-on-surface">Search calls</Label>
          <div className="relative max-w-md">
            <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
            <Input id="calls-q" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9" placeholder="CALL-20261029-0001, name or policy no." />
          </div>
        </div>
        <div role="group" aria-label="Filter by outcome" className="flex flex-wrap gap-1 text-label-xs">
          {[null, ...OUTCOMES].map((o) => (
            <button key={o ?? "all"} type="button" aria-pressed={outcome === o} onClick={() => { setOutcome(o); setPage(1); }}
              className={cn("rounded-lg px-2.5 py-1.5 font-semibold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-lang-border",
                outcome === o ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high")}>
              {o ? OUTCOME_LABEL[o] : "All outcomes"}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        numeric={["qa", "duration"]}
        onRowClick={(c) => router.push(`/calls/${c.id}`)}
        rowLabel={(c) => `Open call ${c.call_ref}`}
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total}
        onPage={setPage}
        empty={{
          icon: History,
          title: query || outcome ? "No calls match these filters" : own ? "You haven't handled any calls yet" : "No calls yet",
          description: query || outcome ? "Try a different search or outcome." : "Calls appear here as soon as they end.",
        }}
      />
    </div>
  );
}
