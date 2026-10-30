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
    <div className="flex flex-col gap-space-lg">
      <PageHeader
        title="Bot Studio"
        description="Write and test the voice agent's system prompts. A new version reaches the bot only after Operations or Compliance approves it."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className="size-3" />View only</Pill> : undefined}
      />
      {error && <ErrorBox error={error} onRetry={() => refetch()} />}

      <div className="grid grid-cols-2 gap-space-lg">
        {MODES.map((mode) => {
          const active = data?.find((s) => s.mode === mode && s.active);
          const waiting = data?.filter((s) => s.mode === mode && s.status === "pending").length ?? 0;
          return (
            <div key={mode} className="flex items-center gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-card">
              <span className="flex size-10 items-center justify-center rounded-lg bg-surface-container-high text-primary"><Bot aria-hidden className="size-5" /></span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-headline-sm text-on-surface">Vani · {MODE_LABEL[mode]}</span>
                <span className="text-label-sm text-on-surface-variant">
                  {isLoading ? "Loading…" : active ? `${active.name} v${active.version} · approved ${active.reviewed_at ? formatDateTime(active.reviewed_at) : ""}` : "No approved script: calls can't start"}
                </span>
              </div>
              {active && <Pill tone="success">Live on bot</Pill>}
              {waiting > 0 && <Pill tone="warning">{waiting} awaiting approval</Pill>}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-12 items-start gap-space-lg">
        <Panel title="Versions" className="col-span-3">
          {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          {data?.length === 0 && <p className="text-body-sm text-on-surface-variant">No scripts yet.</p>}
          {MODES.map((mode) => data?.some((s) => s.mode === mode) && (
            <div key={mode} className="flex flex-col gap-space-xs">
              <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">{MODE_LABEL[mode]}</span>
              {data.filter((s) => s.mode === mode).map((s) => (
                <button key={s.id} type="button" onClick={() => setSelectedId(s.id)} aria-pressed={s.id === selected?.id}
                  className={cn("flex flex-col gap-1 rounded-lg border p-space-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border",
                    s.id === selected?.id ? "border-primary bg-surface-container-low" : "border-divider hover:bg-table-head")}>
                  <div className="flex items-center justify-between gap-space-sm">
                    <span className="truncate text-label-md text-on-surface">v{s.version} · {s.name}</span>
                    {s.active ? <Pill tone="success">Live</Pill> : <Pill tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Pill>}
                  </div>
                  <span className="text-label-xs text-on-surface-variant">{s.created_by_name} · {formatDateTime(s.created_at)}</span>
                </button>
              ))}
            </div>
          ))}
        </Panel>

        <div className="col-span-6">
          {selected ? <Editor key={selected.id} script={selected} canWrite={canWrite} onSaved={refresh} />
            : !isLoading && <EmptyState icon={Bot} title="No script selected" description="Pick a version on the left to read or edit it." />}
        </div>

        <div className="col-span-3">
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
        <div className="flex gap-space-sm">
          {editable && (
            <>
              <Button size="sm" variant="outline" disabled={!dirty || !!invalid || save.isPending} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Save aria-hidden />}Save draft
              </Button>
              <Confirm size="sm" label="Submit for approval" icon={<Send aria-hidden />} busy={submit.isPending} disabled={!!invalid}
                title={`Submit “${script.name}” v${script.version} for approval?`}
                description="Operations or Compliance will review it against the compliance checklist. You can't edit it while it waits; the bot keeps using the current approved version."
                onConfirm={() => submit.mutateAsync()} />
            </>
          )}
          {canWrite && !editable && (
            <Button size="sm" variant="outline" disabled={fork.isPending} onClick={() => fork.mutate()}>
              {fork.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <CopyPlus aria-hidden />}New version from this
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-space-sm text-label-sm text-on-surface-variant">
        <Pill tone={script.active ? "success" : STATUS[script.status].tone}>{script.active ? "Live on bot" : STATUS[script.status].label}</Pill>
        <span>{MODE_LABEL[script.mode]} · by {script.created_by_name}</span>
        {script.submitted_at && <span>· submitted {formatDateTime(script.submitted_at)}</span>}
        {script.reviewed_by_name && script.reviewed_at && <span>· reviewed by {script.reviewed_by_name}, {formatDateTime(script.reviewed_at)}</span>}
        {!editable && <span className="ml-auto flex items-center gap-1"><Lock aria-hidden className="size-3.5" />Read only</span>}
      </div>
      {script.review_note && (
        <p className={cn("rounded-lg border p-space-sm text-body-sm", script.status === "rejected" ? "border-danger-border bg-danger-bg text-danger-text" : "border-success-border bg-success-bg text-success-text")}>
          Reviewer note: {script.review_note}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="s-name">Script name</Label>
        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!editable} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="s-prompt">Persona and rules</Label>
          <span className="text-label-xs text-on-surface-variant">{prompt.length.toLocaleString("en-IN")} / 20,000 characters</span>
        </div>
        <Textarea id="s-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} readOnly={!editable}
          aria-invalid={editable && !!invalid} aria-describedby={invalid && editable ? "s-prompt-error" : undefined}
          className="field-sizing-fixed h-[28rem] resize-y border-divider bg-surface-container-low font-mono text-body-sm text-on-surface" />
        {editable && invalid && <p id="s-prompt-error" className="text-label-sm text-danger-text">{invalid}</p>}
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
    <div className="flex flex-col gap-space-lg">
      <Panel title="Test call" action={<Pill tone="warning">Simulated</Pill>}>
        {canWrite ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="t-says">Customer says</Label>
              <Input id="t-says" value={says} onChange={(e) => setSays(e.target.value)} maxLength={500} />
            </div>
            <Button variant="ai" disabled={!says.trim() || run.isPending} onClick={() => run.mutate()}>
              {run.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Play aria-hidden />}Run test call on v{script.version}
            </Button>
          </>
        ) : (
          <p className="text-body-sm text-on-surface-variant">Test calls are run by the Bot Designer.</p>
        )}
        {result ? (
          <ol className="flex flex-col gap-space-sm" aria-label="Test call transcript">
            {result.turns.map((t, i) => (
              <li key={i} className={cn("rounded-lg p-space-sm text-body-sm",
                t.speaker === "bot" ? "bg-primary-container text-on-primary" : "ml-6 bg-surface-container-low text-on-surface")}>
                <span className="block text-label-xs opacity-80">{t.speaker === "bot" ? "Vani (AI)" : "Customer"}</span>
                {t.text}
              </li>
            ))}
          </ol>
        ) : canWrite && (
          <div className="flex flex-col items-center gap-space-sm py-space-md text-center text-body-sm text-on-surface-variant">
            <MessageSquareText aria-hidden className="size-6 text-primary-container" />
            Run a test to preview the opening of a call with this version.
          </div>
        )}
        {result && <p className="text-label-xs text-on-surface-variant">{result.note}</p>}
      </Panel>
      {result && (
        <Panel title="Compliance pre-check" action={
          <Pill tone={Object.values(result.checks).every(Boolean) ? "success" : "warning"}>
            {Object.values(result.checks).filter(Boolean).length}/{Object.keys(result.checks).length} found
          </Pill>
        }>
          <ul className="flex flex-col gap-space-sm">
            {Object.entries(result.checks).map(([k, ok]) => (
              <li key={k} className="flex items-start gap-space-sm text-body-sm">
                {ok ? <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-secondary" /> : <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />}
                <span className="flex-1">{CHECK_LABEL[k] ?? k}</span>
                <span className="text-label-xs text-on-surface-variant">{ok ? "Found" : "Missing"}</span>
              </li>
            ))}
          </ul>
          <p className="text-label-xs text-on-surface-variant">Keyword check of the prompt. The approver makes the final call.</p>
        </Panel>
      )}
    </div>
  );
}
