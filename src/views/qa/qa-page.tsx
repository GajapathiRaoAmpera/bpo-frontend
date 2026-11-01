"use client";

import { Eye, MousePointerClick } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { useLevel } from "@/components/ops/use-level";
import { QAQueueTable } from "@/components/qa/qa-queue-table";
import { QAReview } from "@/components/qa/qa-review";
import { QAStateFilter } from "@/components/qa/qa-state-filter";
import { useQAQueue } from "@/components/qa/use-qa";
import type { QAState } from "@/components/qa/utils";

import styles from "./qa-page.module.scss";

export function QAPage() {
  const canWrite = useLevel("qa") === "full";
  const [state, setState] = useState<QAState>("open");
  const [page, setPage] = useState(1);
  const [callId, setCallId] = useState<number | null>(null);
  const queue = useQAQueue(state, page);

  return (
    <div className={styles.page}>
      <PageHeader
        title="QA Review"
        description="Check the AI's 5-point quality score against the transcript, correct it where needed and lock the evaluation. Lowest scores are listed first."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className={styles.pillIcon} />View only</Pill> : undefined}
        actions={<QAStateFilter state={state} onState={(s) => { setState(s); setPage(1); }} />}
      />
      <div className={styles.layout}>
        <div className={styles.queueCol}>
          <QAQueueTable data={queue.data} isLoading={queue.isLoading} error={queue.error} onRetry={() => queue.refetch()}
            page={page} onPage={setPage} state={state} callId={callId} onSelect={setCallId} />
        </div>
        <div className={styles.detailCol}>
          {callId ? <QAReview key={callId} callId={callId} canWrite={canWrite} />
            : <EmptyState icon={MousePointerClick} title="Select a call to review" description="Pick a call from the queue to read its transcript next to the AI's QA score." />}
        </div>
      </div>
    </div>
  );
}
