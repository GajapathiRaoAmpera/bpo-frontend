"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { CampaignKpis } from "@/components/campaigns/campaign-kpis";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";
import { CampaignsTable } from "@/components/campaigns/campaigns-table";
import { useCampaignDone, useCampaigns } from "@/components/campaigns/use-campaigns";
import { PageHeader } from "@/components/common/page-header";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./campaigns-page.module.scss";

export function CampaignsPage() {
  const level = useLevel("campaigns");
  const canWrite = level === "full";
  const [editing, setEditing] = useState<Schemas["CampaignOut"] | "new" | null>(null);
  const { data, isLoading, error, refetch } = useCampaigns();
  const done = useCampaignDone();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Outbound Campaigns"
        description={IS_SANDBOX ? "Build renewal campaigns, send them for maker-checker approval, and launch them on the AI dialler. Sandbox launches place simulated calls only." : "Build renewal campaigns, send them for maker-checker approval, and launch them on the AI dialler."}
        actions={canWrite && !editing && <Button onClick={() => setEditing("new")}><Plus aria-hidden />New campaign</Button>}
      />
      <CampaignKpis rows={data ?? []} />
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
      <CampaignsTable data={data} isLoading={isLoading} error={error} onRetry={() => refetch()}
        canWrite={canWrite} onEdit={setEditing} onNew={() => setEditing("new")} />
    </div>
  );
}
