"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Megaphone, Plus } from "lucide-react";

import { CampaignRowActions } from "@/components/campaigns/campaign-row-actions";
import { useLaunchCampaign, useSubmitCampaign } from "@/components/campaigns/use-campaigns";
import { pct } from "@/components/campaigns/utils";
import { Pill } from "@/components/common/pill";
import { STATUS } from "@/components/maker-checker/shared";
import { DataTable, type Features } from "@/components/ops/data-table";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";

import styles from "./campaigns-table.module.scss";

type Campaign = Schemas["CampaignOut"];

function segmentText(c: Campaign) {
  const seg = c.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] };
  const langs = (seg.languages ?? []).map((l) => LANGUAGE_LABEL[l]).join(", ");
  return `Renewing in ${seg.renewal_within_days ?? 30} days · ${langs}`;
}

export function CampaignsTable({ data, isLoading, error, onRetry, canWrite, onEdit, onNew }: {
  data: Campaign[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  canWrite: boolean;
  onEdit: (c: Campaign) => void;
  onNew: () => void;
}) {
  const submit = useSubmitCampaign();
  const launch = useLaunchCampaign();

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
            <div className={styles.dialledBar} style={{ width: `${pct(c.dialled, c.total_targets)}%` }} />
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
        <CampaignRowActions campaign={c} canWrite={canWrite} onEdit={() => onEdit(c)} submit={submit} launch={launch} />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      numeric={["connected", "converted"]}
      empty={{
        icon: Megaphone, title: "No campaigns yet",
        description: "Create a renewal campaign to start reaching policyholders before their renewal date.",
        action: canWrite ? <Button onClick={onNew}><Plus aria-hidden />New campaign</Button> : undefined,
      }}
    />
  );
}
