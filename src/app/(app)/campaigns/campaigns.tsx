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
import { IS_SANDBOX } from "@/lib/personas";
import { cn } from "@/lib/utils";

import styles from "./campaigns.module.scss";

type Campaign = Schemas["CampaignOut"];
const KEY = ["campaigns"] as const;

const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

function Kpi({ label, value, foot, ratio }: { label: string; value: string; foot: string; ratio: number }) {
  return (
    <div className={styles.kpi}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${Math.min(ratio, 100)}%` }} />
      </div>
      <span className={styles.kpiFoot}>{foot}</span>
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
        <div className={styles.campaignCell}>
          <span className={styles.campaignName}>{c.name}</span>
          <span className={styles.small}>{segmentText(c)}</span>
        </div>
      ),
    },
    { id: "product", header: "Line of business", cell: ({ row: { original: c } }) => <Pill tone="info">{PRODUCT_LABEL[c.product]}</Pill> },
    {
      id: "script", header: "Voice AI script",
      cell: ({ row: { original: c } }) => c.script ? <span className={styles.script}>{c.script.name} · v{c.script.version}</span> : "—",
    },
    {
      id: "progress", header: "Dialled progress",
      cell: ({ row: { original: c } }) => (
        <div className={styles.progress}>
          <div className={styles.progressHead}>
            <span>{c.dialled.toLocaleString("en-IN")} / {c.total_targets.toLocaleString("en-IN")}</span>
            <span className={styles.progressPct}>{pct(c.dialled, c.total_targets)}%</span>
          </div>
          <div className={styles.track}>
            <div className={cn(styles.bar, styles.barDialled)} style={{ width: `${pct(c.dialled, c.total_targets)}%` }} />
          </div>
        </div>
      ),
    },
    { id: "connected", header: "Connected", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.connected}</span> },
    { id: "converted", header: "Converted", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.converted}</span> },
    {
      id: "status", header: "Status",
      cell: ({ row: { original: c } }) => (
        <div className={styles.status}>
          <Pill tone={STATUS[c.status].tone} pulse={c.status === "running"}>{STATUS[c.status].label}</Pill>
          {c.scheduled_at && <span className={styles.small}>From {formatDate(c.scheduled_at)}</span>}
        </div>
      ),
    },
    {
      id: "actions", header: "",
      cell: ({ row: { original: c } }) => (
        <div className={styles.rowActions}>
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
              description={IS_SANDBOX ? "The sandbox places the next 3 simulated AI calls from this campaign, with transcripts and QA scores, and updates progress. No real customer is called." : "Real phone dialling is not set up yet, so the launch will be refused. No customer is called."}
              confirmLabel="Place 3 simulated calls" onConfirm={() => launch.mutateAsync(c)} />
          )}
          {!canWrite && c.status === "pending" && (
            <Button size="sm" variant="outline" asChild><Link href="/approvals"><ShieldCheck aria-hidden />Review</Link></Button>
          )}
          {c.status === "rejected" && c.review_note && (
            <span className={styles.rejectNote} title={c.review_note}>{c.review_note}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader
        title="Outbound Campaigns"
        description={IS_SANDBOX ? "Build renewal campaigns, send them for maker-checker approval, and launch them on the AI dialler. Sandbox launches place simulated calls only." : "Build renewal campaigns, send them for maker-checker approval, and launch them on the AI dialler."}
        actions={canWrite && !editing && <Button onClick={() => setEditing("new")}><Plus aria-hidden />New campaign</Button>}
      />
      <div className={styles.kpiGrid}>
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
