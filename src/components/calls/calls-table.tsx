"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Bot, History, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import { PAGE_SIZE } from "@/components/calls/use-calls";
import { Pill } from "@/components/common/pill";
import { DataTable, type Features } from "@/components/ops/data-table";
import { OUTCOME_TONE, SENTIMENT_TONE } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL, SENTIMENT_LABEL } from "@/lib/labels";

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

export function CallsTable({ data, isLoading, error, onRetry, page, onPage, filtered, own }: {
  data: Schemas["CallPage"] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  onPage: (page: number) => void;
  filtered: boolean;
  own: boolean;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={data?.items}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      numeric={["qa", "duration"]}
      onRowClick={(c) => router.push(`/calls/${c.id}`)}
      rowLabel={(c) => `Open call ${c.call_ref}`}
      page={page}
      pageSize={PAGE_SIZE}
      total={data?.total}
      onPage={onPage}
      empty={{
        icon: History,
        title: filtered ? "No calls match these filters" : own ? "You haven't handled any calls yet" : "No calls yet",
        description: filtered ? "Try a different search or outcome." : "Calls appear here as soon as they end.",
      }}
    />
  );
}
