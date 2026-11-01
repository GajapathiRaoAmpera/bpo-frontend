"use client";

import { Loader2, PhoneOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { Schemas } from "@/lib/api";
import { OUTCOME_LABEL } from "@/lib/labels";

import styles from "./wrap-up-form.module.scss";

const WRAP_UP: Schemas["CallOutcome"][] = ["payment_link_sent", "callback_scheduled", "info_provided", "not_interested", "escalated"];

export function WrapUpForm({ verified, onEnd, busy }: {
  verified: boolean;
  onEnd: (outcome?: Schemas["CallOutcome"], note?: string) => void;
  busy: boolean;
}) {
  const [outcome, setOutcome] = useState<Schemas["CallOutcome"]>("payment_link_sent");
  const [note, setNote] = useState("");

  return (
    <form
      className={styles.wrapUp}
      onSubmit={(e) => {
        e.preventDefault();
        onEnd(outcome, note || undefined);
      }}
    >
      <fieldset className={styles.outcomes}>
        <legend className={styles.legend}>How did the call end?</legend>
        <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as Schemas["CallOutcome"])} className={styles.outcomeGrid}>
          {WRAP_UP.map((o) => (
            <Label key={o} htmlFor={`o-${o}`} className={styles.outcome}>
              <RadioGroupItem id={`o-${o}`} value={o} />
              {OUTCOME_LABEL[o]}
            </Label>
          ))}
        </RadioGroup>
        {(outcome === "payment_link_sent" || outcome === "callback_scheduled") && !verified && (
          <p className={styles.warning}>The customer isn&apos;t verified, so no link or callback will be created; your note is saved.</p>
        )}
      </fieldset>
      <div className={styles.noteField}>
        <Label htmlFor="wrap-note" className={styles.noteLabel}>Note for the record</Label>
        <Textarea id="wrap-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2}
          placeholder="e.g. Customer will pay tonight after salary credit." />
      </div>
      <Button type="submit" disabled={busy} className={styles.submit}>
        {busy ? <Loader2 aria-hidden className={styles.spinner} /> : <PhoneOff aria-hidden />} End call
      </Button>
    </form>
  );
}
