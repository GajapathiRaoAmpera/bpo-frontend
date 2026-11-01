"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Save, Send, X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { CampaignAudienceStep } from "@/components/campaigns/campaign-audience-step";
import { CampaignDetailsStep } from "@/components/campaigns/campaign-details-step";
import { CampaignReviewStep } from "@/components/campaigns/campaign-review-step";
import { useAudience, useSaveCampaign } from "@/components/campaigns/use-campaigns";
import { type CampaignValues, campaignSchema, LANGUAGES } from "@/components/campaigns/utils";
import { Panel } from "@/components/maker-checker/shared";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { cn } from "@/lib/utils";

import styles from "./campaign-wizard.module.scss";

const STEPS = ["Campaign details", "Audience", "Review & schedule"] as const;

const istDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(iso));

export function CampaignWizard({ campaign, onClose, onSaved }: {
  campaign: Schemas["CampaignOut"] | null;
  onClose: () => void;
  onSaved: (c: Schemas["CampaignOut"], submitted: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const seg = campaign?.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] } | undefined;
  const form = useForm<CampaignValues>({
    resolver: zodResolver(campaignSchema),
    mode: "onTouched",
    defaultValues: {
      name: campaign?.name ?? "",
      product: campaign?.product ?? "motor",
      renewal_within_days: seg?.renewal_within_days ?? 30,
      languages: seg?.languages ?? [...LANGUAGES],
      start_date: campaign?.scheduled_at ? istDay(campaign.scheduled_at) : "",
    },
  });
  const v = useWatch({ control: form.control }) as CampaignValues;
  const audience = useAudience(v, step > 0);
  const save = useSaveCampaign(campaign, onSaved);

  async function next() {
    const fields: (keyof CampaignValues)[][] = [["name", "product"], ["renewal_within_days", "languages"]];
    if (await form.trigger(fields[step])) setStep(step + 1);
  }

  return (
    <Panel
      title={campaign ? `Edit draft · ${campaign.name}` : "New renewal campaign"}
      action={<Button size="icon-sm" variant="ghost" aria-label="Close the campaign wizard" onClick={onClose}><X aria-hidden /></Button>}
    >
      <ol className={styles.steps} aria-label="Wizard steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}
            className={cn(styles.step, i === step && styles.stepCurrent)}>
            <span className={cn(styles.stepNo, i <= step && styles.stepNoDone)}>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        {step === 0 && <CampaignDetailsStep form={form} />}
        {step === 1 && <CampaignAudienceStep form={form} product={v.product} counting={audience.isFetching} total={audience.data?.total_targets} />}
        {step === 2 && <CampaignReviewStep form={form} values={v} audience={audience.data} />}

        <div className={styles.footer}>
          <Button type="button" variant="outline" onClick={() => (step ? setStep(step - 1) : onClose())}>
            <ArrowLeft aria-hidden />{step ? "Back" : "Cancel"}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={next}>Continue<ArrowRight aria-hidden /></Button>
          ) : (
            <div className={styles.footerActions}>
              <Button type="button" variant="outline" disabled={save.isPending}
                onClick={form.handleSubmit((values) => save.mutate({ values, submit: false }))}>
                <Save aria-hidden />Save draft
              </Button>
              <Button type="button" disabled={save.isPending || !audience.data?.total_targets}
                onClick={form.handleSubmit((values) => save.mutate({ values, submit: true }))}>
                {save.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Send aria-hidden />}Save and submit for approval
              </Button>
            </div>
          )}
        </div>
      </form>
    </Panel>
  );
}
