"use client";

import { CircleCheck, CircleX } from "lucide-react";

import { Pill, type PillTone } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatDuration, OUTCOME_LABEL, QA_LABEL, SENTIMENT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./call-summary.module.scss";

const OUTCOME_TONE: Record<Schemas["CallOutcome"], PillTone> = {
  payment_link_sent: "success", renewed: "success", callback_scheduled: "info", escalated: "danger",
  info_provided: "neutral", not_interested: "warning", no_answer: "neutral",
};
const SENTIMENT_TONE: Record<Schemas["Sentiment"], PillTone> = { positive: "success", neutral: "neutral", negative: "danger" };

export function CallSummary({ session }: { session: Schemas["SessionOut"] }) {
  if (session.analysis_pending) {
    return (
      <SectionCard size="sm" title="Call summary" action={<Pill tone="live" pulse>Analysing</Pill>}>
        <div aria-busy="true" className={styles.pending}>
          <p className={styles.muted}>Writing the summary and QA score with Gemini…</p>
          <Skeleton className={cn(styles.line, styles.lineFull)} />
          <Skeleton className={cn(styles.line, styles.lineLong)} />
          <Skeleton className={cn(styles.line, styles.lineShort)} />
        </div>
      </SectionCard>
    );
  }
  const qa = session.qa;
  return (
    <SectionCard size="sm" title="Call summary" action={session.outcome && <Pill tone={OUTCOME_TONE[session.outcome]}>{OUTCOME_LABEL[session.outcome]}</Pill>}>
      <div className={styles.stack}>
        <div className={styles.summaryMeta}>
          <span className={styles.mono}>{session.call_ref}</span>
          <span>·</span>
          <span>{formatDuration(session.duration_sec)}</span>
          {session.sentiment && <Pill tone={SENTIMENT_TONE[session.sentiment]}>{SENTIMENT_LABEL[session.sentiment]} sentiment</Pill>}
        </div>
        {session.summary && <p className={styles.summary}>{session.summary}</p>}
        {session.next_action && (
          <div className={styles.nextAction}>
            <span className={styles.eyebrow}>Next action</span>
            <p className={styles.nextActionText}>{session.next_action}</p>
          </div>
        )}
        {qa && (
          <div className={styles.qa}>
            <div className={styles.qaHead}>
              <span className={styles.label}>QA score</span>
              <span className={styles.score}>{qa.score} / 5</span>
            </div>
            <ul className={styles.checks}>
              {(Object.keys(QA_LABEL) as (keyof typeof QA_LABEL)[]).map((k) => (
                <li key={k} className={styles.check}>
                  {qa[k]
                    ? <CircleCheck aria-label="Passed" className={styles.passIcon} />
                    : <CircleX aria-label="Failed" className={styles.failIcon} />}
                  <span className={qa[k] ? styles.passed : styles.failed}>{QA_LABEL[k]}</span>
                </li>
              ))}
            </ul>
            <span className={styles.footnote}>Scored by AI · QA analysts can review it in QA Review</span>
          </div>
        )}
        {!qa && session.outcome !== "no_answer" && (
          <p className={styles.notScored}>
            QA not scored automatically. A QA analyst will review this call.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
