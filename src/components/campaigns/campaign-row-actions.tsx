"use client";

import { PencilLine, Rocket, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { useLaunchCampaign, useSubmitCampaign } from "@/components/campaigns/use-campaigns";
import { Confirm } from "@/components/maker-checker/shared";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./campaign-row-actions.module.scss";

export function CampaignRowActions({ campaign: c, canWrite, onEdit, submit, launch }: {
  campaign: Schemas["CampaignOut"];
  canWrite: boolean;
  onEdit: () => void;
  submit: ReturnType<typeof useSubmitCampaign>;
  launch: ReturnType<typeof useLaunchCampaign>;
}) {
  return (
    <div className={styles.rowActions}>
      {canWrite && c.status === "draft" && (
        <>
          <Button size="sm" variant="outline" onClick={onEdit}><PencilLine aria-hidden />Edit</Button>
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
  );
}
