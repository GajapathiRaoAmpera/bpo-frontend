"use client";

import { ErrorBox } from "@/components/maker-checker/shared";
import { QAEvaluationPanel } from "@/components/qa/qa-evaluation-panel";
import { QATranscriptPanel } from "@/components/qa/qa-transcript-panel";
import { useQADetail } from "@/components/qa/use-qa";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./qa-review.module.scss";

export function QAReview({ callId, canWrite }: { callId: number; canWrite: boolean }) {
  const { data, isLoading, error, refetch } = useQADetail(callId);
  if (error) return <ErrorBox error={error} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className={styles.skeleton} />;
  return (
    <div className={styles.review}>
      <QATranscriptPanel d={data} className={styles.transcriptPanel} />
      <QAEvaluationPanel d={data} canWrite={canWrite} className={styles.evalPanel} />
    </div>
  );
}
