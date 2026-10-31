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

import styles from "./calls-table.module.scss";

type Row = Schemas["CallRow"];
const h = createColumnHelper<Features, Row>();
const columns = h.columns([
  h.display({ id: "ref", header: "Call", cell: ({ row: { original: c } }) => (
    <div className={styles.stack}>
      <span className={styles.ref}>{c.call_ref}</span>
      <span className={styles.when}>{formatDateTime(c.started_at)}</span>
    </div>
  ) }),
  h.display({ id: "customer", header: "Customer", cell: ({ row: { original: c } }) => (
    <div className={styles.stack}>
      <span className={styles.name}>{c.customer_name ?? "Unidentified caller"}</span>
      <span className={styles.policy}>{c.policy_no ?? "—"}</span>
    </div>
  ) }),
  h.display({ id: "mode", header: "Type", cell: ({ row: { original: c } }) => (c.mode === "renewal" ? "Renewal · outbound" : "Inbound query") }),
  h.display({ id: "handled", header: "Handled by", cell: ({ row: { original: c } }) => (
    <span className={styles.handled}>
      {c.agent_name ? <UserRound aria-hidden className={styles.agentIcon} /> : <Bot aria-hidden className={styles.botIcon} />}
      {c.agent_name ? `AI + ${c.agent_name}` : "AI agent"}
    </span>
  ) }),
  h.display({ id: "outcome", header: "Outcome", cell: ({ row: { original: c } }) => (c.outcome
    ? <Pill tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Pill> : <Pill tone="live" pulse>In progress</Pill>) }),
  h.display({ id: "sentiment", header: "Sentiment", cell: ({ row: { original: c } }) => (c.sentiment
    ? <Pill tone={SENTIMENT_TONE[c.sentiment]}>{SENTIMENT_LABEL[c.sentiment]}</Pill> : "—") }),
  h.display({ id: "qa", header: "QA", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.qa_score === null ? "—" : `${c.qa_score}/5`}</span> }),
  h.display({ id: "duration", header: "Duration", cell: ({ row: { original: c } }) => <span className={styles.mono}>{formatDuration(c.duration_sec)}</span> }),
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
    <div className={styles.page}>
      <PageHeader
        title="Call History"
        badge={own ? <Pill tone="info">Your calls</Pill> : undefined}
        description={own
          ? "Calls you handled or took over, with outcome, sentiment, AI summary, transcript and QA score."
          : "Every call with outcome, sentiment, AI summary, transcript and QA score. Open a call to read the transcript."}
      />
      <div className={styles.filters}>
        <div className={styles.search}>
          <Label htmlFor="calls-q" className={styles.searchLabel}>Search calls</Label>
          <div className={styles.searchBox}>
            <Search aria-hidden className={styles.searchIcon} />
            <Input id="calls-q" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className={styles.searchInput} placeholder="CALL-20261029-0001, name or policy no." />
          </div>
        </div>
        <div role="group" aria-label="Filter by outcome" className={styles.outcomes}>
          {[null, ...OUTCOMES].map((o) => (
            <button key={o ?? "all"} type="button" aria-pressed={outcome === o} onClick={() => { setOutcome(o); setPage(1); }}
              className={cn(styles.outcome, outcome === o && styles.outcomeActive)}>
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
