"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, CircleCheckBig, Megaphone, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { CHECK_LABEL, Confirm, ErrorBox, MODE_LABEL, Panel } from "@/components/maker-checker/shared";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

type ScriptItem = Schemas["ScriptApproval"];
type Campaign = Schemas["CampaignOut"];
type Selected = { kind: "script"; id: number } | { kind: "campaign"; id: number };
const KEY = ["approvals"] as const;

export function Approvals() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => unwrap(api.GET("/api/v1/approvals")) });
  const [sel, setSel] = useState<Selected | null>(null);

  const script = data?.scripts.find((s) => sel?.kind === "script" && s.script.id === sel.id);
  const campaign = data?.campaigns.find((c) => sel?.kind === "campaign" && c.id === sel.id);
  // Default to the oldest waiting item.
  const fallbackScript = !script && !campaign ? data?.scripts[0] : undefined;
  const fallbackCampaign = !script && !campaign && !fallbackScript ? data?.campaigns[0] : undefined;
  const shownScript = script ?? fallbackScript;
  const shownCampaign = campaign ?? fallbackCampaign;
  const total = (data?.scripts.length ?? 0) + (data?.campaigns.length ?? 0);

  return (
    <div className="flex flex-col gap-space-lg">
      <PageHeader
        title="Approvals"
        description="Maker-checker for bot scripts and outbound campaigns. Compare each change with what is live, tick the compliance checklist, then approve or send it back."
        badge={data ? <Pill tone={total ? "warning" : "success"}>{total} awaiting review</Pill> : undefined}
      />
      {error && <ErrorBox error={error} onRetry={() => refetch()} />}
      {isLoading && <Skeleton className="h-96 rounded-lg" />}
      {data && total === 0 && (
        <EmptyState icon={CircleCheckBig} title="Nothing awaiting approval"
          description="New script versions and campaigns appear here when their makers submit them." />
      )}
      {data && total > 0 && (
        <div className="grid grid-cols-12 items-start gap-space-lg">
          <Panel title="Queue" className="col-span-3">
            {data.scripts.map(({ script: s }) => (
              <QueueButton key={`s${s.id}`} active={shownScript?.script.id === s.id} onClick={() => setSel({ kind: "script", id: s.id })}
                icon={<Bot aria-hidden className="size-4" />} title={`${s.name} v${s.version}`}
                meta={`Script · ${MODE_LABEL[s.mode]} · ${s.created_by_name}`} when={s.submitted_at} />
            ))}
            {data.campaigns.map((c) => (
              <QueueButton key={`c${c.id}`} active={shownCampaign?.id === c.id} onClick={() => setSel({ kind: "campaign", id: c.id })}
                icon={<Megaphone aria-hidden className="size-4" />} title={c.name}
                meta={`Campaign · ${PRODUCT_LABEL[c.product]} · ${c.created_by_name}`} when={c.submitted_at} />
            ))}
          </Panel>
          {shownScript && <ScriptReview key={`s${shownScript.script.id}`} item={shownScript} checks={data.script_checks} />}
          {shownCampaign && <CampaignReview key={`c${shownCampaign.id}`} campaign={shownCampaign} checks={data.campaign_checks} />}
        </div>
      )}
    </div>
  );
}

function QueueButton({ active, onClick, icon, title, meta, when }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; meta: string; when: string | null;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn("flex gap-space-sm rounded-lg border p-space-sm text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border",
        active ? "border-primary bg-surface-container-low" : "border-divider hover:bg-table-head")}>
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-primary">{icon}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-label-md text-on-surface">{title}</span>
        <span className="truncate text-label-xs text-on-surface-variant">{meta}</span>
        {when && <span className="text-label-xs text-outline">Submitted {formatDateTime(when)}</span>}
      </span>
    </button>
  );
}

/** Checklist + note + approve/reject, shared by scripts and campaigns. */
function Decision({ name, checks, onDecide }: {
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
      <ul className="flex flex-col gap-space-sm">
        {checks.map((k) => (
          <li key={k} className="flex items-start gap-space-sm">
            <Checkbox id={`chk-${k}`} className="mt-0.5" checked={!!ticked[k]} onCheckedChange={(on) => setTicked({ ...ticked, [k]: on === true })} />
            <Label htmlFor={`chk-${k}`} className="font-normal text-body-sm">{CHECK_LABEL[k] ?? k}</Label>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="review-note">Reviewer note</Label>
        <Textarea id="review-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000}
          placeholder="Required when sending back" className="min-h-24 border-divider text-body-sm" />
      </div>
      <div className="flex flex-col gap-space-sm">
        <Confirm label="Approve" icon={<ThumbsUp aria-hidden />} busy={busy === "approve"} disabled={!allTicked || busy !== null}
          title={`Approve “${name}”?`} description="It goes live immediately: approved scripts replace the bot's current version; approved campaigns can be launched by their maker. This is recorded in the audit log."
          onConfirm={() => decide(true)} />
        <Confirm label="Send back" variant="destructive" icon={<ThumbsDown aria-hidden />} busy={busy === "reject"} disabled={!note.trim() || busy !== null}
          title={`Reject “${name}”?`} description="The maker sees your note and must create a new version. This is recorded in the audit log."
          confirmLabel="Reject with note" onConfirm={() => decide(false)} />
        {!allTicked && <p className="text-label-xs text-on-surface-variant">Tick every check to approve. Add a note to send it back.</p>}
      </div>
    </Panel>
  );
}

function useDecide(kind: "script" | "campaign", id: number, name: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ approve, body }: { approve: boolean; body: Schemas["ReviewIn"] }): Promise<unknown> => kind === "script"
      ? unwrap(api.POST(approve ? "/api/v1/scripts/{script_id}/approve" : "/api/v1/scripts/{script_id}/reject", { params: { path: { script_id: id } }, body }))
      : unwrap(api.POST(approve ? "/api/v1/campaigns/{campaign_id}/approve" : "/api/v1/campaigns/{campaign_id}/reject", { params: { path: { campaign_id: id } }, body })),
    onSuccess: (_, { approve }) => {
      toast.success(approve ? `Approved “${name}”` : `Sent “${name}” back to its maker`);
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: [kind === "script" ? "scripts" : "campaigns"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

function ScriptReview({ item, checks }: { item: ScriptItem; checks: string[] }) {
  const { script: s, base, diff } = item;
  const name = `${s.name} v${s.version}`;
  const decide = useDecide("script", s.id, name);
  const changed = diff.filter((d) => d.tag !== "equal").length;
  const tone = { equal: "", delete: "bg-danger-bg text-danger-text", insert: "bg-success-bg text-success-text", replace: "" };

  return (
    <>
      <Panel className="col-span-6" title={`Changes · ${MODE_LABEL[s.mode]}`} action={<Pill tone="info">{changed} lines changed</Pill>}>
        <div className="overflow-hidden rounded-lg border border-divider">
          <div className="grid grid-cols-2 border-b border-divider bg-table-head text-label-xs tracking-wider text-on-surface-variant uppercase">
            <span className="px-space-sm py-2">{base ? `Live · v${base.version}` : "No approved version"}</span>
            <span className="border-l border-divider px-space-sm py-2">Proposed · v{s.version}</span>
          </div>
          <div className="max-h-[36rem] overflow-y-auto font-mono text-[12px] leading-5">
            {diff.map((d, i) => (
              <div key={i} className="grid grid-cols-2">
                <span className={cn("px-space-sm whitespace-pre-wrap", d.tag === "replace" ? "bg-danger-bg text-danger-text" : d.tag === "delete" && tone.delete)}>
                  {d.left !== null && d.tag !== "equal" && <span className="sr-only">Removed: </span>}{d.left ?? ""}
                </span>
                <span className={cn("border-l border-divider px-space-sm whitespace-pre-wrap", d.tag === "replace" ? "bg-success-bg text-success-text" : d.tag === "insert" && tone.insert)}>
                  {d.right !== null && d.tag !== "equal" && <span className="sr-only">Added: </span>}{d.right ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-label-sm text-on-surface-variant">
          By {s.created_by_name}{s.submitted_at && `, submitted ${formatDateTime(s.submitted_at)}`}. The bot keeps running {base ? `v${base.version}` : "nothing"} until this is approved.
        </p>
      </Panel>
      <div className="col-span-3">
        <Decision name={name} checks={checks} onDecide={(approve, body) => decide.mutateAsync({ approve, body })} />
      </div>
    </>
  );
}

function CampaignReview({ campaign: c, checks }: { campaign: Campaign; checks: string[] }) {
  const decide = useDecide("campaign", c.id, c.name);
  const seg = c.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] };
  const rows: [string, React.ReactNode][] = [
    ["Line of business", PRODUCT_LABEL[c.product]],
    ["Audience", `${c.total_targets.toLocaleString("en-IN")} policies renewing within ${seg.renewal_within_days ?? 30} days`],
    ["Languages", (seg.languages ?? []).map((l) => LANGUAGE_LABEL[l]).join(", ")],
    ["Voice AI script", c.script ? `${c.script.name} · v${c.script.version}` : "—"],
    ["Start", c.scheduled_at ? `${formatDate(c.scheduled_at)}, 09:00 IST` : "As soon as approved"],
    ["Calling window", "09:00–19:00 IST"],
    ["Maker", `${c.created_by_name}${c.submitted_at ? `, submitted ${formatDateTime(c.submitted_at)}` : ""}`],
  ];
  return (
    <>
      <Panel className="col-span-6" title={c.name} action={<Pill tone="warning"><ShieldCheck aria-hidden className="size-3" />Awaiting approval</Pill>}>
        <dl className="divide-y divide-divider">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-space-md py-2.5 text-body-sm">
              <dt className="text-label-xs tracking-wider text-on-surface-variant uppercase">{k}</dt>
              <dd className="col-span-2 text-on-surface">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-label-sm text-on-surface-variant">Once approved, the maker can launch it. Sandbox launches place 3 simulated AI calls at a time.</p>
      </Panel>
      <div className="col-span-3">
        <Decision name={c.name} checks={checks} onDecide={(approve, body) => decide.mutateAsync({ approve, body })} />
      </div>
    </>
  );
}
