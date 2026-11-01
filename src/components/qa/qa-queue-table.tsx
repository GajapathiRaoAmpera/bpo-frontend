"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Lock } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { MODE_LABEL } from "@/components/maker-checker/shared";
import { DataTable, type Features } from "@/components/ops/data-table";
import { OUTCOME_TONE } from "@/components/ops/tones";
import { PAGE_SIZE } from "@/components/qa/use-qa";
import { type QAState, scoreTone } from "@/components/qa/utils";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { OUTCOME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./qa-queue-table.module.scss";

type Row = Schemas["QARow"];

export function QAQueueTable({ data, isLoading, error, onRetry, page, onPage, state, callId, onSelect }: {
  data: Schemas["QAPage"] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  onPage: (page: number) => void;
  state: QAState;
  callId: number | null;
  onSelect: (callId: number) => void;
}) {
  const columns: ColumnDef<Features, Row>[] = [
    {
      id: "call", header: "Call",
      cell: ({ row: { original: r } }) => (
        <div className={cn(styles.callCell, r.call_id === callId && styles.callCellActive)}>
          <span className={styles.callRef}>{r.call_ref}</span>
          <span className={styles.callMeta}>{formatDateTime(r.started_at)} · {MODE_LABEL[r.mode]}</span>
        </div>
      ),
    },
    { id: "customer", header: "Customer", cell: ({ row: { original: r } }) => r.customer_name ?? "Unidentified caller" },
    { id: "outcome", header: "Outcome", cell: ({ row: { original: r } }) => r.outcome ? <Pill tone={OUTCOME_TONE[r.outcome]}>{OUTCOME_LABEL[r.outcome]}</Pill> : "—" },
    {
      id: "score", header: "QA score",
      cell: ({ row: { original: r } }) => (
        <span className={styles.score}>
          <Pill tone={scoreTone(r.score)}>{r.score === null ? "Not scored" : `${r.score}/5`}</Pill>
          {r.locked_at && <Lock aria-label="Locked" className={styles.lockIcon} />}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data?.items}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onRowClick={(r) => onSelect(r.call_id)}
      rowLabel={(r) => `Review ${r.call_ref}`}
      page={page} pageSize={PAGE_SIZE} total={data?.total} onPage={onPage}
      empty={{
        icon: ClipboardCheck,
        title: state === "open" ? "Every evaluation is locked" : "No evaluations here yet",
        description: state === "open" ? "New calls appear here after the AI scores them." : "Locked evaluations are listed once a QA analyst locks them.",
      }}
    />
  );
}
