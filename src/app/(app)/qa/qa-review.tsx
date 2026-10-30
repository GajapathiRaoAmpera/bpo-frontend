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
        <div className={cn("flex flex-col py-1", r.call_id === callId && "font-semibold")}>
          <span className="text-data-mono text-primary">{r.call_ref}</span>
          <span className="text-label-xs text-on-surface-variant">{formatDateTime(r.started_at)} · {MODE_LABEL[r.mode]}</span>
        </div>
      ),
    },
    { id: "customer", header: "Customer", cell: ({ row: { original: r } }) => r.customer_name ?? "Unidentified caller" },
    { id: "outcome", header: "Outcome", cell: ({ row: { original: r } }) => r.outcome ? <Pill tone={OUTCOME_TONE[r.outcome]}>{OUTCOME_LABEL[r.outcome]}</Pill> : "—" },
    {
      id: "score", header: "QA score",
      cell: ({ row: { original: r } }) => (
        <span className="inline-flex items-center gap-1.5">
          <Pill tone={scoreTone(r.score)}>{r.score === null ? "Not scored" : `${r.score}/5`}</Pill>
          {r.locked_at && <Lock aria-label="Locked" className="size-3.5 text-on-surface-variant" />}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <PageHeader
        title="QA Review"
        description="Check the AI's 5-point quality score against the transcript, correct it where needed and lock the evaluation. Lowest scores are listed first."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className="size-3" />View only</Pill> : undefined}
        actions={
          <div role="group" aria-label="Filter evaluations" className="flex rounded-lg bg-surface-container-low p-1">
            {STATES.map(([key, label]) => (
              <Button key={key} size="sm" variant={state === key ? "default" : "ghost"} aria-pressed={state === key}
                onClick={() => { setState(key); setPage(1); }}>{label}</Button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-12 items-start gap-space-lg">
        <div className="col-span-5">
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
        <div className="col-span-7">
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
  if (isLoading || !data) return <Skeleton className="h-[32rem] rounded-lg" />;
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
    <div className="grid grid-cols-7 items-start gap-space-lg">
      <Panel className="col-span-4" title={`Transcript · ${d.call_ref}`} action={<span className="text-label-sm text-on-surface-variant">{formatDuration(d.duration_sec)}</span>}>
        {d.summary && <p className="rounded-lg bg-surface-container-low p-space-sm text-body-sm text-on-surface">{d.summary}</p>}
        <ol className="flex max-h-[36rem] flex-col gap-space-sm overflow-y-auto pr-1" aria-label="Call transcript">
          {d.turns.length === 0 && <li className="text-body-sm text-on-surface-variant">No transcript was captured for this call.</li>}
          {d.turns.map((t) => t.speaker === "tool" ? (
            <li key={t.seq} className="flex items-center gap-space-sm text-label-xs text-secondary">
              <span className="h-px flex-1 bg-divider" />{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}: {t.text}<span className="h-px flex-1 bg-divider" />
            </li>
          ) : (
            <li key={t.seq} className={cn("flex flex-col gap-0.5 rounded-lg p-space-sm text-body-sm",
              t.speaker === "bot" ? "mr-6 bg-surface-container-low text-on-surface" : t.speaker === "agent" ? "ml-6 bg-warning-bg text-on-surface" : "ml-6 border border-divider")}>
              <span className="text-label-xs text-on-surface-variant">
                {t.speaker === "bot" ? "Vani (AI)" : t.speaker === "agent" ? "Human agent" : "Customer"} · {formatTime(new Date(start + t.offset_ms))}
              </span>
              {t.text}
            </li>
          ))}
        </ol>
      </Panel>
      <Panel className="col-span-3" title="QA evaluation" action={<Pill tone={scoreTone(score)}>{score}/5</Pill>}>
        <div className="flex flex-wrap gap-space-sm text-label-xs text-on-surface-variant">
          <span>Scored by {d.source === "human" ? d.reviewer_name ?? "QA analyst" : d.source === "ai" ? "AI (Gemini Flash)" : "nobody yet"}</span>
          {d.locked_at && <Pill tone="neutral"><Lock aria-hidden className="size-3" />Locked {formatDateTime(d.locked_at)}</Pill>}
        </div>
        <ul className="flex flex-col gap-space-sm">
          {CHECKS.map((k) => (
            <li key={k} className="flex items-start gap-space-sm">
              <Checkbox id={`qa-${k}`} className="mt-0.5" checked={checks[k]} disabled={!editable}
                onCheckedChange={(on) => setChecks({ ...checks, [k]: on === true })} />
              <Label htmlFor={`qa-${k}`} className="flex-1 font-normal text-body-sm">{QA_LABEL[k]}</Label>
              <span className={cn("text-label-xs", checks[k] ? "text-secondary" : "text-danger-text")}>{checks[k] ? "Pass" : "Fail"}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="qa-note">Reviewer note</Label>
          <Textarea id="qa-note" value={note} onChange={(e) => setNote(e.target.value)} readOnly={!editable} maxLength={2000}
            className="min-h-24 border-divider text-body-sm" />
        </div>
        {editable && (
          <div className="flex flex-col gap-space-sm">
            <Button variant="outline" disabled={save.isPending} onClick={() => save.mutate(false)}>
              {save.isPending && save.variables === false ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}Save review
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
