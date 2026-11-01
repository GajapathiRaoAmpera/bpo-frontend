"use client";

import { CircleCheckBig } from "lucide-react";
import { useState } from "react";

import { ApprovalQueue, type ApprovalSelection } from "@/components/approvals/approval-queue";
import { CampaignReview } from "@/components/approvals/campaign-review";
import { ScriptReview } from "@/components/approvals/script-review";
import { useApprovals } from "@/components/approvals/use-approvals";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { ErrorBox } from "@/components/maker-checker/shared";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./approvals-page.module.scss";

export function ApprovalsPage() {
  const { data, isLoading, error, refetch } = useApprovals();
  const [sel, setSel] = useState<ApprovalSelection | null>(null);

  const script = data?.scripts.find((s) => sel?.kind === "script" && s.script.id === sel.id);
  const campaign = data?.campaigns.find((c) => sel?.kind === "campaign" && c.id === sel.id);
  // Default to the oldest waiting item.
  const fallbackScript = !script && !campaign ? data?.scripts[0] : undefined;
  const fallbackCampaign = !script && !campaign && !fallbackScript ? data?.campaigns[0] : undefined;
  const shownScript = script ?? fallbackScript;
  const shownCampaign = campaign ?? fallbackCampaign;
  const total = (data?.scripts.length ?? 0) + (data?.campaigns.length ?? 0);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Approvals"
        description="Maker-checker for bot scripts and outbound campaigns. Compare each change with what is live, tick the compliance checklist, then approve or send it back."
        badge={data ? <Pill tone={total ? "warning" : "success"}>{total} awaiting review</Pill> : undefined}
      />
      {error && <ErrorBox error={error} onRetry={() => refetch()} />}
      {isLoading && <Skeleton className={styles.loading} />}
      {data && total === 0 && (
        <EmptyState icon={CircleCheckBig} title="Nothing awaiting approval"
          description="New script versions and campaigns appear here when their makers submit them." />
      )}
      {data && total > 0 && (
        <div className={styles.layout}>
          <ApprovalQueue scripts={data.scripts} campaigns={data.campaigns} onSelect={setSel}
            activeScriptId={shownScript?.script.id} activeCampaignId={shownCampaign?.id} />
          {shownScript && <ScriptReview key={`s${shownScript.script.id}`} item={shownScript} checks={data.script_checks} />}
          {shownCampaign && <CampaignReview key={`c${shownCampaign.id}`} campaign={shownCampaign} checks={data.campaign_checks} />}
        </div>
      )}
    </div>
  );
}
