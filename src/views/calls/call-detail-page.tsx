"use client";

import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";

import { CallEscalationsCard } from "@/components/calls/call-escalations-card";
import { CallFollowupsCard } from "@/components/calls/call-followups-card";
import { CallHero } from "@/components/calls/call-hero";
import { CallPolicyCard } from "@/components/calls/call-policy-card";
import { CallQACard } from "@/components/calls/call-qa-card";
import { CallSummaryCard } from "@/components/calls/call-summary-card";
import { CallTranscriptCard } from "@/components/calls/call-transcript-card";
import { useCall } from "@/components/calls/use-calls";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";

import styles from "./call-detail-page.module.scss";

type Params = Promise<{ id: string }>;

export function CallDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Skeleton className={styles.fallback} />}>
      <CallDetail params={params} />
    </Suspense>
  );
}

function CallDetail({ params }: { params: Params }) {
  const { id } = use(params);
  const callId = Number(id);
  const { data: c, isLoading, error, refetch } = useCall(callId);

  const back = <Button asChild variant="outline"><Link href="/calls"><ArrowLeft aria-hidden />Back to call history</Link></Button>;
  if (!Number.isInteger(callId) || (error instanceof ApiError && error.status === 404)) {
    return <EmptyState icon={FileQuestion} title="Call not found" description="This call doesn't exist or isn't one you can open." action={back} />;
  }
  if (error) return <ErrorAlert onRetry={() => refetch()}>{error.message}</ErrorAlert>;
  if (isLoading || !c) {
    return (
      <div className={styles.page} aria-busy="true">
        <Skeleton className={styles.skeletonHeader} />
        <div className={styles.skeletonGrid}>
          <Skeleton className={styles.skeletonMain} />
          <Skeleton className={styles.skeletonSide} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/calls" className={styles.crumbLink}>Call History</Link>
        <span aria-hidden>›</span>
        <span className={styles.crumbRef}>{c.call_ref}</span>
      </nav>

      <CallHero c={c} back={back} />

      <div className={styles.columns}>
        <div className={styles.mainCol}>
          {(c.summary || c.next_action) && <CallSummaryCard summary={c.summary} nextAction={c.next_action} />}
          <CallTranscriptCard turns={c.turns} />
        </div>

        <div className={styles.sideCol}>
          <CallQACard qa={c.qa} />
          {c.policy && <CallPolicyCard policy={c.policy} />}
          {c.escalations.length > 0 && <CallEscalationsCard escalations={c.escalations} />}
          {c.followups.length > 0 && <CallFollowupsCard followups={c.followups} />}
        </div>
      </div>
    </div>
  );
}
