"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ClipboardCheck, Eye, Loader2, Lock, MousePointerClick, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Confirm, ErrorBox, MODE_LABEL, Panel } from "@/components/maker-checker/shared";
import { DataTable, type Features } from "@/components/ops/data-table";
import { OUTCOME_TONE } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime, formatTime } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL, QA_LABEL, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./qa-review.module.scss";

type Row = Schemas["QARow"];
type Check = keyof typeof QA_LABEL;
const CHECKS = Object.keys(QA_LABEL) as Check[];
const STATES = [["open", "To review"], ["locked", "Locked"], ["all", "All"]] as const;
const PAGE_SIZE = 15;

const scoreTone = (s: number | null) => (s === null ? "neutral" : s >= 5 ? "success" : s >= 4 ? "warning" : "danger");

export function QAReview() {
  const canWrite = useLevel("qa") === "full";
  const [state, setState] = useState<(typeof STATES)[number][0]>("open");
  const [page, setPage] = useState(1);
  const [callId, setCallId] = useState<number | null>(null);
  const queue = useQuery({
    queryKey: ["qa", "queue", state, page],
    queryFn: () => unwrap(api.GET("/api/v1/qa/queue", { params: { query: { state, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });

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
    <div className={styles.page}>
      <PageHeader
        title="QA Review"
        description="Check the AI's 5-point quality score against the transcript, correct it where needed and lock the evaluation. Lowest scores are listed first."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className={styles.pillIcon} />View only</Pill> : undefined}
        actions={
          <div role="group" aria-label="Filter evaluations" className={styles.filter}>
            {STATES.map(([key, label]) => (
              <Button key={key} size="sm" variant={state === key ? "default" : "ghost"} aria-pressed={state === key}
                onClick={() => { setState(key); setPage(1); }}>{label}</Button>
            ))}
          </div>
        }
      />
      <div className={styles.layout}>
        <div className={styles.queueCol}>
          <DataTable
            columns={columns}
            data={queue.data?.items}
            isLoading={queue.isLoading}
            error={queue.error}
            onRetry={() => queue.refetch()}
            onRowClick={(r) => setCallId(r.call_id)}
            rowLabel={(r) => `Review ${r.call_ref}`}
            page={page} pageSize={PAGE_SIZE} total={queue.data?.total} onPage={setPage}
            empty={{
              icon: ClipboardCheck,
              title: state === "open" ? "Every evaluation is locked" : "No evaluations here yet",
              description: state === "open" ? "New calls appear here after the AI scores them." : "Locked evaluations are listed once a QA analyst locks them.",
            }}
          />
        </div>
        <div className={styles.detailCol}>
          {callId ? <Review key={callId} callId={callId} canWrite={canWrite} />
            : <EmptyState icon={MousePointerClick} title="Select a call to review" description="Pick a call from the queue to read its transcript next to the AI's QA score." />}
        </div>
      </div>
    </div>
  );
}

function Review({ callId, canWrite }: { callId: number; canWrite: boolean }) {
  const qc = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["qa", "detail", callId],
    queryFn: () => unwrap(api.GET("/api/v1/qa/{call_id}", { params: { path: { call_id: callId } } })),
  });
  if (error) return <ErrorBox error={error} onRetry={() => refetch()} />;
  if (isLoading || !data) return <Skeleton className={styles.skeleton} />;
  return <ReviewForm d={data} canWrite={canWrite} onSaved={(d, lock) => {
    qc.setQueryData(["qa", "detail", callId], d);
    void qc.invalidateQueries({ queryKey: ["qa", "queue"] });
    toast.success(lock ? `Evaluation for ${d.call_ref} locked` : `Review saved for ${d.call_ref}`);
  }} />;
}

function ReviewForm({ d, canWrite, onSaved }: { d: Schemas["QADetail"]; canWrite: boolean; onSaved: (d: Schemas["QADetail"], lock: boolean) => void }) {
  const editable = canWrite && !d.locked_at;
  const [checks, setChecks] = useState<Record<Check, boolean>>(
    () => Object.fromEntries(CHECKS.map((k) => [k, d[k] ?? false])) as Record<Check, boolean>);
  const [note, setNote] = useState(d.reviewer_note ?? "");
  const score = CHECKS.filter((k) => checks[k]).length;
  const save = useMutation({
    mutationFn: (lock: boolean) => unwrap(api.PUT("/api/v1/qa/{call_id}", {
      params: { path: { call_id: d.call_id } }, body: { ...checks, note: note.trim() || null, lock },
    })),
    onSuccess: (r, lock) => onSaved(r, lock),
    onError: (e) => toast.error(e.message),
  });
  const start = new Date(d.started_at).getTime();

  return (
    <div className={styles.review}>
      <Panel className={styles.transcriptPanel} title={`Transcript · ${d.call_ref}`} action={<span className={styles.duration}>{formatDuration(d.duration_sec)}</span>}>
        {d.summary && <p className={styles.summary}>{d.summary}</p>}
        <ol className={styles.transcript} aria-label="Call transcript">
          {d.turns.length === 0 && <li className={styles.empty}>No transcript was captured for this call.</li>}
          {d.turns.map((t) => t.speaker === "tool" ? (
            <li key={t.seq} className={styles.toolTurn}>
              <span className={styles.rule} />{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}: {t.text}<span className={styles.rule} />
            </li>
          ) : (
            <li key={t.seq} className={cn(styles.turn,
              t.speaker === "bot" ? styles.turnBot : t.speaker === "agent" ? styles.turnAgent : styles.turnCustomer)}>
              <span className={styles.speaker}>
                {t.speaker === "bot" ? "Vani (AI)" : t.speaker === "agent" ? "Human agent" : "Customer"} · {formatTime(new Date(start + t.offset_ms))}
              </span>
              {t.text}
            </li>
          ))}
        </ol>
      </Panel>
      <Panel className={styles.evalPanel} title="QA evaluation" action={<Pill tone={scoreTone(score)}>{score}/5</Pill>}>
        <div className={styles.scoredBy}>
          <span>Scored by {d.source === "human" ? d.reviewer_name ?? "QA analyst" : d.source === "ai" ? "AI (Gemini Flash)" : "nobody yet"}</span>
          {d.locked_at && <Pill tone="neutral"><Lock aria-hidden className={styles.pillIcon} />Locked {formatDateTime(d.locked_at)}</Pill>}
        </div>
        <ul className={styles.checks}>
          {CHECKS.map((k) => (
            <li key={k} className={styles.check}>
              <Checkbox id={`qa-${k}`} className={styles.checkbox} checked={checks[k]} disabled={!editable}
                onCheckedChange={(on) => setChecks({ ...checks, [k]: on === true })} />
              <Label htmlFor={`qa-${k}`} className={styles.checkLabel}>{QA_LABEL[k]}</Label>
              <span className={checks[k] ? styles.pass : styles.fail}>{checks[k] ? "Pass" : "Fail"}</span>
            </li>
          ))}
        </ul>
        <div className={styles.noteField}>
          <Label htmlFor="qa-note">Reviewer note</Label>
          <Textarea id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} readOnly={!editable} maxLength={2000}
            className={styles.note} />
        </div>
        {editable && (
          <div className={styles.actions}>
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate(false)}>
              {save.isPending && save.variables === false ? <Loader2 aria-hidden className={styles.spinner} /> : <Save aria-hidden />}Save review
            </Button>
            <Confirm label="Lock evaluation" icon={<Lock aria-hidden />} busy={save.isPending && save.variables === true}
              title={`Lock the evaluation for ${d.call_ref}?`}
              description={`The score of ${score}/5 and your note become final and can't be edited again. This is recorded in the audit log.`}
              onConfirm={() => save.mutateAsync(true)} />
          </div>
        )}
      </Panel>
    </div>
  );
}
