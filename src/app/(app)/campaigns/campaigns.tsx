"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Megaphone, PencilLine, Plus, Rocket, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { CampaignWizard } from "@/app/(app)/campaigns/campaign-wizard";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Confirm, STATUS } from "@/components/maker-checker/shared";
import { DataTable, type Features } from "@/components/ops/data-table";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";

type Campaign = Schemas["CampaignOut"];
const KEY = ["campaigns"] as const;

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

function Kpi({ label, value, foot, ratio }: { label: string; value: string; foot: string; ratio: number }) {
  return (
    <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-card">
      <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">{label}</span>
      <span className="text-display text-on-surface">{value}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(ratio, 100)}%` }} />
      </div>
      <span className="text-label-sm text-on-surface-variant">{foot}</span>
    </div>
  );
}

function segmentText(c: Campaign) {
  const seg = c.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] };
  const langs = (seg.languages ?? []).map((l) => LANGUAGE_LABEL[l]).join(", ");
  return `Renewing in ${seg.renewal_within_days ?? 30} days · ${langs}`;
}

export function Campaigns() {
  const qc = useQueryClient();
  const level = useLevel("campaigns");
  const canWrite = level === "full";
  const [editing, setEditing] = useState<Campaign | "new" | null>(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: KEY, queryFn: () => unwrap(api.GET("/api/v1/campaigns")) });

  const done = (msg: string) => {
    toast.success(msg);
    void qc.invalidateQueries({ queryKey: KEY });
  };
  const submit = useMutation({
    mutationFn: (c: Campaign) => unwrap(api.POST("/api/v1/campaigns/{campaign_id}/submit", { params: { path: { campaign_id: c.id } } })),
    onSuccess: (c) => done(`“${c.name}” sent for approval`),
    onError: (e) => toast.error(e.message),
  });
  const launch = useMutation({
    mutationFn: (c: Campaign) => unwrap(api.POST("/api/v1/campaigns/{campaign_id}/launch", { params: { path: { campaign_id: c.id } } })),
    onSuccess: (r) => {
      done(`${r.call_ids.length} simulated calls placed for “${r.campaign.name}”`);
      void qc.invalidateQueries({ queryKey: ["calls"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const rows = data ?? [];
  const live = rows.filter((c) => c.status === "running" || c.status === "completed");
  const sum = (k: "total_targets" | "dialled" | "connected" | "converted") => live.reduce((s, c) => s + c[k], 0);
  const [targets, dialled, connected, converted] = [sum("total_targets"), sum("dialled"), sum("connected"), sum("converted")];

  const columns: ColumnDef<Features, Campaign>[] = [
    {
      id: "campaign", header: "Campaign & cohort",
      cell: ({ row: { original: c } }) => (
        <div className="flex flex-col gap-0.5 py-space-sm">
          <span className="text-label-md text-primary">{c.name}</span>
          <span className="text-label-xs text-on-surface-variant">{segmentText(c)}</span>
        </div>
      ),
    },
    { id: "product", header: "Line of business", cell: ({ row: { original: c } }) => <Pill tone="info">{PRODUCT_LABEL[c.product]}</Pill> },
    {
      id: "script", header: "Voice AI script",
      cell: ({ row: { original: c } }) => c.script ? <span className="text-body-sm">{c.script.name} · v{c.script.version}</span> : "—",
    },
    {
      id: "progress", header: "Dialled progress",
      cell: ({ row: { original: c } }) => (
        <div className="flex min-w-40 flex-col gap-1">
          <div className="flex justify-between text-data-mono">
            <span>{c.dialled.toLocaleString("en-IN")} / {c.total_targets.toLocaleString("en-IN")}</span>
            <span className="text-secondary">{pct(c.dialled, c.total_targets)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-secondary" style={{ width: `${pct(c.dialled, c.total_targets)}%` }} />
          </div>
        </div>
      ),
    },
    { id: "connected", header: "Connected", cell: ({ row: { original: c } }) => <span className="text-data-mono">{c.connected}</span> },
    { id: "converted", header: "Converted", cell: ({ row: { original: c } }) => <span className="text-data-mono">{c.converted}</span> },
    {
      id: "status", header: "Status",
      cell: ({ row: { original: c } }) => (
        <div className="flex flex-col items-start gap-0.5">
          <Pill tone={STATUS[c.status].tone} pulse={c.status === "running"}>{STATUS[c.status].label}</Pill>
          {c.scheduled_at && <span className="text-label-xs text-on-surface-variant">From {formatDate(c.scheduled_at)}</span>}
        </div>
      ),
    },
    {
      id: "actions", header: "",
      cell: ({ row: { original: c } }) => (
        <div className="flex justify-end gap-space-xs">
          {canWrite && c.status === "draft" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(c)}><PencilLine aria-hidden />Edit</Button>
              <Confirm size="sm" label="Submit" icon={<Send aria-hidden />} busy={submit.isPending && submit.variables?.id === c.id}
                title={`Submit “${c.name}” for approval?`}
                description={`${c.total_targets.toLocaleString("en-IN")} policies. Operations or Compliance must approve it before it can launch; you can't edit it while it waits.`}
                confirmLabel="Submit for approval" onConfirm={() => submit.mutateAsync(c)} />
            </>
          )}
          {canWrite && (c.status === "approved" || c.status === "running") && (
            <Confirm size="sm" variant="ai" label={c.status === "approved" ? "Launch" : "Dial next 3"} icon={<Rocket aria-hidden />}
              busy={launch.isPending && launch.variables?.id === c.id}
              title={`Launch “${c.name}”?`}
              description="The sandbox places the next 3 simulated AI calls from this campaign, with transcripts and QA scores, and updates progress. No real customer is called."
              confirmLabel="Place 3 simulated calls" onConfirm={() => launch.mutateAsync(c)} />
          )}
          {!canWrite && c.status === "pending" && (
            <Button size="sm" variant="outline" asChild><Link href="/approvals"><ShieldCheck aria-hidden />Review</Link></Button>
          )}
          {c.status === "rejected" && c.review_note && (
            <span className="max-w-48 truncate text-label-xs text-danger-text" title={c.review_note}>{c.review_note}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <PageHeader
        title="Outbound Campaigns"
        description="Build renewal campaigns, send them for maker-checker approval, and launch them on the AI dialler. Sandbox launches place simulated calls only."
        actions={canWrite && !editing && <Button onClick={() => setEditing("new")}><Plus aria-hidden />New campaign</Button>}
      />
      <div className="grid grid-cols-5 gap-space-lg">
        <Kpi label="Total targets" value={targets.toLocaleString("en-IN")} ratio={100} foot={`${live.length} launched campaigns`} />
        <Kpi label="Dialled" value={dialled.toLocaleString("en-IN")} ratio={pct(dialled, targets)} foot={`${pct(dialled, targets)}% of targets`} />
        <Kpi label="Connected" value={connected.toLocaleString("en-IN")} ratio={pct(connected, dialled)} foot={`${pct(connected, dialled)}% answer rate`} />
        <Kpi label="Converted" value={converted.toLocaleString("en-IN")} ratio={pct(converted, connected)} foot={`${pct(converted, connected)}% of connected`} />
        <Kpi label="Awaiting approval" value={String(rows.filter((c) => c.status === "pending").length)}
          ratio={0} foot="Checked by Operations or Compliance" />
      </div>
      {editing && (
        <CampaignWizard
          campaign={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(c, submitted) => {
            setEditing(null);
            done(submitted ? `“${c.name}” sent for approval` : `Draft “${c.name}” saved`);
          }}
        />
      )}
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        numeric={["connected", "converted"]}
        empty={{
          icon: Megaphone, title: "No campaigns yet",
          description: "Create a renewal campaign to start reaching policyholders before their renewal date.",
          action: canWrite ? <Button onClick={() => setEditing("new")}><Plus aria-hidden />New campaign</Button> : undefined,
        }}
      />
    </div>
  );
}
