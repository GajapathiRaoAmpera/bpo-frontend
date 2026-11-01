"use client";

import { CheckCircle2, Hand, Loader2 } from "lucide-react";

import { NOTE_ERROR } from "@/components/escalations/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Schemas } from "@/lib/api";

import styles from "./escalation-actions.module.scss";

// Claim + resolve form. Note state lives in the page so selecting another escalation clears it.
export function EscalationActions({ escalation: e, blocked, note, noteError, onNoteChange, onNoteError, onClaim, claiming, onResolve, resolving }: {
  escalation: Schemas["EscalationRow"];
  blocked: boolean;
  note: string;
  noteError: string | null;
  onNoteChange: (note: string) => void;
  onNoteError: (error: string) => void;
  onClaim: () => void;
  claiming: boolean;
  onResolve: () => void;
  resolving: boolean;
}) {
  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>Handle this escalation</h2>
      {blocked ? (
        <p className={styles.handledElsewhere}>{e.assigned_to_name} is handling this escalation.</p>
      ) : <>
        {e.status === "open" && (
          <Button className={styles.inlineAction} onClick={onClaim} disabled={claiming}>
            {claiming ? <Loader2 aria-hidden className={styles.spinner} /> : <Hand aria-hidden />}
            {claiming ? "Claiming…" : "Claim escalation"}
          </Button>
        )}
        <div className={styles.noteField}>
          <Label htmlFor="resolution" className={styles.noteLabel}>Resolution note</Label>
          <Textarea id="resolution" rows={3} value={note} aria-invalid={!!noteError} aria-describedby={noteError ? "resolution-error" : undefined}
            onChange={(ev) => onNoteChange(ev.target.value)}
            onBlur={() => note && note.trim().length < 3 && onNoteError(NOTE_ERROR)}
            placeholder="What you did for the customer" />
          {noteError && <p id="resolution-error" className={styles.noteError}>{noteError}</p>}
        </div>
        <Button variant="secondary" className={styles.inlineAction} onClick={onResolve} disabled={resolving}>
          {resolving ? <Loader2 aria-hidden className={styles.spinner} /> : <CheckCircle2 aria-hidden />}
          {resolving ? "Resolving…" : "Resolve escalation"}
        </Button>
      </>}
    </section>
  );
}
