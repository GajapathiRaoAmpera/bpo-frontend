"use client";

import { CopyPlus, Loader2, Lock, Save, Send } from "lucide-react";
import { useState } from "react";

import { useScriptActions } from "@/components/bot-studio/use-bot-studio";
import { Pill } from "@/components/common/pill";
import { Confirm, MODE_LABEL, Panel, STATUS } from "@/components/maker-checker/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./script-editor.module.scss";

type Script = Schemas["ScriptOut"];

export function ScriptEditor({ script, canWrite, onSaved }: { script: Script; canWrite: boolean; onSaved: (s: Script, msg: string) => void }) {
  const editable = canWrite && script.status === "draft";
  const [name, setName] = useState(script.name);
  const [prompt, setPrompt] = useState(script.system_prompt);
  const invalid = prompt.trim().length < 20 ? "The prompt needs at least 20 characters" : name.trim().length < 3 ? "The name needs at least 3 characters" : null;
  const dirty = name !== script.name || prompt !== script.system_prompt;
  const { save, submit, fork } = useScriptActions(script, onSaved);
  const draft = { name, system_prompt: prompt };

  return (
    <Panel
      title={`System prompt · v${script.version}`}
      action={
        <div className={styles.toolbar}>
          {editable && (
            <>
              <Button size="sm" variant="outline" disabled={!dirty || !!invalid || save.isPending} onClick={() => save.mutate(draft)}>
                {save.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Save aria-hidden />}Save draft
              </Button>
              <Confirm size="sm" label="Submit for approval" icon={<Send aria-hidden />} busy={submit.isPending} disabled={!!invalid}
                title={`Submit “${script.name}” v${script.version} for approval?`}
                description="Operations or Compliance will review it against the compliance checklist. You can't edit it while it waits; the bot keeps using the current approved version."
                onConfirm={() => submit.mutateAsync(dirty ? draft : null)} />
            </>
          )}
          {canWrite && !editable && (
            <Button size="sm" variant="outline" disabled={fork.isPending} onClick={() => fork.mutate()}>
              {fork.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <CopyPlus aria-hidden />}New version from this
            </Button>
          )}
        </div>
      }
    >
      <div className={styles.scriptMeta}>
        <Pill tone={script.active ? "success" : STATUS[script.status].tone}>{script.active ? "Live on bot" : STATUS[script.status].label}</Pill>
        <span>{MODE_LABEL[script.mode]} · by {script.created_by_name}</span>
        {script.submitted_at && <span>· submitted {formatDateTime(script.submitted_at)}</span>}
        {script.reviewed_by_name && script.reviewed_at && <span>· reviewed by {script.reviewed_by_name}, {formatDateTime(script.reviewed_at)}</span>}
        {!editable && <span className={styles.readOnly}><Lock aria-hidden />Read only</span>}
      </div>
      {script.review_note && (
        <p className={cn(styles.reviewNote, script.status === "rejected" ? styles.reviewRejected : styles.reviewApproved)}>
          Reviewer note: {script.review_note}
        </p>
      )}
      <div className={styles.field}>
        <Label htmlFor="s-name">Script name</Label>
        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!editable} />
      </div>
      <div className={styles.field}>
        <div className={styles.fieldHead}>
          <Label htmlFor="s-prompt">Persona and rules</Label>
          <span className={styles.small}>{prompt.length.toLocaleString("en-IN")} / 20,000 characters</span>
        </div>
        <Textarea id="s-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} readOnly={!editable}
          aria-invalid={editable && !!invalid} aria-describedby={invalid && editable ? "s-prompt-error" : undefined}
          className={styles.prompt} />
        {editable && invalid && <p id="s-prompt-error" className={styles.error}>{invalid}</p>}
      </div>
    </Panel>
  );
}
