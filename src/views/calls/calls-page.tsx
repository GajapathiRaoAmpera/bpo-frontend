"use client";

import { useDeferredValue, useState } from "react";

import { CallsFilters } from "@/components/calls/calls-filters";
import { CallsTable } from "@/components/calls/calls-table";
import { useCalls } from "@/components/calls/use-calls";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { useLevel } from "@/components/ops/use-level";
import type { Schemas } from "@/lib/api";

import styles from "./calls-page.module.scss";

export function CallsPage() {
  const own = useLevel("calls") === "own";
  const [q, setQ] = useState("");
  const [outcome, setOutcome] = useState<Schemas["CallOutcome"] | null>(null);
  const [page, setPage] = useState(1);
  const query = useDeferredValue(q.trim());
  const { data, isLoading, error, refetch } = useCalls({ query, outcome, page });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Call History"
        badge={own ? <Pill tone="info">Your calls</Pill> : undefined}
        description={own
          ? "Calls you handled or took over, with outcome, sentiment, AI summary, transcript and QA score."
          : "Every call with outcome, sentiment, AI summary, transcript and QA score. Open a call to read the transcript."}
      />
      <CallsFilters
        q={q} onQ={(v) => { setQ(v); setPage(1); }}
        outcome={outcome} onOutcome={(o) => { setOutcome(o); setPage(1); }}
      />
      <CallsTable data={data} isLoading={isLoading} error={error} onRetry={() => refetch()}
        page={page} onPage={setPage} filtered={!!(query || outcome)} own={own} />
    </div>
  );
}
