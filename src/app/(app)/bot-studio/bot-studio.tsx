"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, CircleCheck, CircleX, CopyPlus, Eye, Loader2, Lock, MessageSquareText, Play, Save, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { CHECK_LABEL, Confirm, ErrorBox, MODE_LABEL, Panel, STATUS } from "@/components/maker-checker/shared";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./bot-studio.module.scss";

type Script = Schemas["ScriptOut"];
const KEY = ["scripts"] as const;
const MODES: Schemas["CallMode"][] = ["renewal", "inbound"];

export function BotStudio() {
  const qc = useQueryClient();
  const canWrite = useLevel("bot_studio") === "full";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => unwrap(api.GET("/api/v1/scripts")) });
  const selected = data?.find((s) => s.id === selectedId) ?? data?.find((s) => s.active) ?? data?.[0];

  const refresh = (s: Script, msg: string) => {
    toast.success(msg);
    setSelectedId(s.id);
    void qc.invalidateQueries({ queryKey: KEY });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Bot Studio"
        description="Write and test the voice agent's system prompts. A new version reaches the bot only after Operations or Compliance approves it."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className={styles.viewOnlyIcon} />View only</Pill> : undefined}
      />
      {error && <ErrorBox error={error} onRetry={() => refetch()} />}

      <div className={styles.modeGrid}>
        {MODES.map((mode) => {
          const active = data?.find((s) => s.mode === mode && s.active);
          const waiting = data?.filter((s) => s.mode === mode && s.status === "pending").length ?? 0;
          return (
            <div key={mode} className={styles.modeTile}>
              <span className={styles.modeIcon}><Bot aria-hidden /></span>
              <div className={styles.modeText}>
                <span className={styles.modeTitle}>Vani · {MODE_LABEL[mode]}</span>
                <span className={styles.modeMeta}>
                  {isLoading ? "Loading…" : active ? `${active.name} v${active.version} · approved ${active.reviewed_at ? formatDateTime(active.reviewed_at) : ""}` : "No approved script: calls can't start"}
                </span>
              </div>
              {active && <Pill tone="success">Live on bot</Pill>}
              {waiting > 0 && <Pill tone="warning">{waiting} awaiting approval</Pill>}
            </div>
          );
        })}
      </div>

      <div className={styles.workspace}>
        <Panel title="Versions" className={styles.versions}>
          {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className={styles.versionSkeleton} />)}
          {data?.length === 0 && <p className={styles.muted}>No scripts yet.</p>}
          {MODES.map((mode) => data?.some((s) => s.mode === mode) && (
            <div key={mode} className={styles.versionGroup}>
              <span className={styles.groupLabel}>{MODE_LABEL[mode]}</span>
              {data.filter((s) => s.mode === mode).map((s) => (
                <button key={s.id} type="button" onClick={() => setSelectedId(s.id)} aria-pressed={s.id === selected?.id}
                  className={cn(styles.version, s.id === selected?.id && styles.versionSelected)}>
                  <div className={styles.versionHead}>
                    <span className={styles.versionName}>v{s.version} · {s.name}</span>
                    {s.active ? <Pill tone="success">Live</Pill> : <Pill tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Pill>}
                  </div>
                  <span className={styles.small}>{s.created_by_name} · {formatDateTime(s.created_at)}</span>
                </button>
              ))}
            </div>
          ))}
        </Panel>

        <div className={styles.editorCol}>
          {selected ? <Editor key={selected.id} script={selected} canWrite={canWrite} onSaved={refresh} />
            : !isLoading && <EmptyState icon={Bot} title="No script selected" description="Pick a version on the left to read or edit it." />}
        </div>

        <div className={styles.sideCol}>
          {selected && <Simulator key={selected.id} script={selected} canWrite={canWrite} />}
        </div>
      </div>
    </div>
  );
}

function Editor({ script, canWrite, onSaved }: { script: Script; canWrite: boolean; onSaved: (s: Script, msg: string) => void }) {
  const editable = canWrite && script.status === "draft";
  const [name, setName] = useState(script.name);
  const [prompt, setPrompt] = useState(script.system_prompt);
  const invalid = prompt.trim().length < 20 ? "The prompt needs at least 20 characters" : name.trim().length < 3 ? "The name needs at least 3 characters" : null;
  const dirty = name !== script.name || prompt !== script.system_prompt;
  const path = { params: { path: { script_id: script.id } } };

  const save = useMutation({
    mutationFn: () => unwrap(api.PATCH("/api/v1/scripts/{script_id}", { ...path, body: { name, system_prompt: prompt } })),
    onSuccess: (s) => onSaved(s, "Draft saved"),
    onError: (e) => toast.error(e.message),
  });
  const submit = useMutation({
    mutationFn: async () => {
      if (dirty) await unwrap(api.PATCH("/api/v1/scripts/{script_id}", { ...path, body: { name, system_prompt: prompt } }));
      return unwrap(api.POST("/api/v1/scripts/{script_id}/submit", path));
    },
    onSuccess: (s) => onSaved(s, `v${s.version} sent for approval`),
    onError: (e) => toast.error(e.message),
  });
  const fork = useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/scripts", {
      body: { name: script.name, mode: script.mode, system_prompt: script.system_prompt, parent_id: script.id },
    })),
    onSuccess: (s) => onSaved(s, `Draft v${s.version} created from v${script.version}`),
    onError: (e) => toast.error(e.message),
  });

  return (
    <Panel
      title={`System prompt · v${script.version}`}
      action={
        <div className={styles.toolbar}>
          {editable && (
            <>
              <Button size="sm" variant="outline" disabled={!dirty || !!invalid || save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Save aria-hidden />}Save draft
              </Button>
              <Confirm size="sm" label="Submit for approval" icon={<Send aria-hidden />} busy={submit.isPending} disabled={!!invalid}
                title={`Submit “${script.name}” v${script.version} for approval?`}
                description="Operations or Compliance will review it against the compliance checklist. You can't edit it while it waits; the bot keeps using the current approved version."
                onConfirm={() => submit.mutateAsync()} />
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

function Simulator({ script, canWrite }: { script: Script; canWrite: boolean }) {
  const [says, setSays] = useState("I want to know when my renewal is due.");
  const run = useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/scripts/{script_id}/test-call", {
      params: { path: { script_id: script.id } }, body: { customer_says: says },
    })),
    onError: (e) => toast.error(e.message),
  });
  const result = run.data;

  return (
    <div className={styles.simulator}>
      <Panel title="Test call" action={<Pill tone="warning">Simulated</Pill>}>
        {canWrite ? (
          <>
            <div className={styles.field}>
              <Label htmlFor="t-says">Customer says</Label>
              <Input id="t-says" value={says} onChange={(e) => setSays(e.target.value)} maxLength={500} />
            </div>
            <Button variant="ai" disabled={!says.trim() || run.isPending} onClick={() => run.mutate()}>
              {run.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Play aria-hidden />}Run test call on v{script.version}
            </Button>
          </>
        ) : (
          <p className={styles.muted}>Test calls are run by the Bot Designer.</p>
        )}
        {result ? (
          <ol className={styles.transcript} aria-label="Test call transcript">
            {result.turns.map((t, i) => (
              <li key={i} className={cn(styles.turn, t.speaker === "bot" ? styles.botTurn : styles.customerTurn)}>
                <span className={styles.speaker}>{t.speaker === "bot" ? "Vani (AI)" : "Customer"}</span>
                {t.text}
              </li>
            ))}
          </ol>
        ) : canWrite && (
          <div className={styles.simEmpty}>
            <MessageSquareText aria-hidden className={styles.simEmptyIcon} />
            Run a test to preview the opening of a call with this version.
          </div>
        )}
        {result && <p className={styles.small}>{result.note}</p>}
      </Panel>
      {result && (
        <Panel title="Compliance pre-check" action={
          <Pill tone={Object.values(result.checks).every(Boolean) ? "success" : "warning"}>
            {Object.values(result.checks).filter(Boolean).length}/{Object.keys(result.checks).length} found
          </Pill>
        }>
          <ul className={styles.checks}>
            {Object.entries(result.checks).map(([k, ok]) => (
              <li key={k} className={styles.check}>
                {ok ? <CircleCheck aria-hidden className={cn(styles.checkIcon, styles.found)} /> : <CircleX aria-hidden className={cn(styles.checkIcon, styles.missing)} />}
                <span className={styles.checkLabel}>{CHECK_LABEL[k] ?? k}</span>
                <span className={styles.small}>{ok ? "Found" : "Missing"}</span>
              </li>
            ))}
          </ul>
          <p className={styles.small}>Keyword check of the prompt. The approver makes the final call.</p>
        </Panel>
      )}
    </div>
  );
}
