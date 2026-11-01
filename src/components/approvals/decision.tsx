"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Pill } from "@/components/common/pill";
import { CHECK_LABEL, Confirm, Panel } from "@/components/maker-checker/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Schemas } from "@/lib/api";

import styles from "./decision.module.scss";

/** Checklist + note + approve/reject, shared by scripts and campaigns. */
export function Decision({ name, checks, onDecide }: {
  name: string;
  checks: string[];
  onDecide: (approve: boolean, body: Schemas["ReviewIn"]) => Promise<unknown>;
}) {
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const allTicked = checks.every((k) => ticked[k]);
  const decide = (approve: boolean) => {
    setBusy(approve ? "approve" : "reject");
    return onDecide(approve, { checklist: ticked, note: note.trim() || null }).finally(() => setBusy(null));
  };

  return (
    <Panel title="Compliance checklist" action={<Pill tone={allTicked ? "success" : "neutral"}>{checks.filter((k) => ticked[k]).length}/{checks.length}</Pill>}>
      <ul className={styles.checklist}>
        {checks.map((k) => (
          <li key={k} className={styles.checkItem}>
            <Checkbox id={`chk-${k}`} className={styles.checkbox} checked={!!ticked[k]} onCheckedChange={(on) => setTicked({ ...ticked, [k]: on === true })} />
            <Label htmlFor={`chk-${k}`} className={styles.checkLabel}>{CHECK_LABEL[k] ?? k}</Label>
          </li>
        ))}
      </ul>
      <div className={styles.field}>
        <Label htmlFor="review-note">Reviewer note</Label>
        <Textarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000}
          placeholder="Required when sending back" className={styles.note} />
      </div>
      <div className={styles.actions}>
        <Confirm label="Approve" icon={<ThumbsUp aria-hidden />} busy={busy === "approve"} disabled={!allTicked || busy !== null}
          title={`Approve “${name}”?`} description="It goes live immediately: approved scripts replace the bot's current version; approved campaigns can be launched by their maker. This is recorded in the audit log."
          onConfirm={() => decide(true)} />
        <Confirm label="Send back" variant="destructive" icon={<ThumbsDown aria-hidden />} busy={busy === "reject"} disabled={!note.trim() || busy !== null}
          title={`Reject “${name}”?`} description="The maker sees your note and must create a new version. This is recorded in the audit log."
          confirmLabel="Reject with note" onConfirm={() => decide(false)} />
        {!allTicked && <p className={styles.hint}>Tick every check to approve. Add a note to send it back.</p>}
      </div>
    </Panel>
  );
}
