"use client";

import { Loader2, Lock, Save } from "lucide-react";
import { useState } from "react";

import { Pill } from "@/components/common/pill";
import { Confirm, Panel } from "@/components/maker-checker/shared";
import { useSaveQAReview } from "@/components/qa/use-qa";
import { scoreTone } from "@/components/qa/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { QA_LABEL } from "@/lib/labels";

import styles from "./qa-evaluation-panel.module.scss";

type Check = keyof typeof QA_LABEL;
const CHECKS = Object.keys(QA_LABEL) as Check[];

export function QAEvaluationPanel({ d, canWrite, className }: { d: Schemas["QADetail"]; canWrite: boolean; className?: string }) {
  const editable = canWrite && !d.locked_at;
  const [checks, setChecks] = useState<Record<Check, boolean>>(
    () => Object.fromEntries(CHECKS.map((k) => [k, d[k] ?? false])) as Record<Check, boolean>);
  const [note, setNote] = useState(d.reviewer_note ?? "");
  const score = CHECKS.filter((k) => checks[k]).length;
  const save = useSaveQAReview(d.call_id, { ...checks, note: note.trim() || null });

  return (
    <Panel className={className} title="QA evaluation" action={<Pill tone={scoreTone(score)}>{score}/5</Pill>}>
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
  );
}
