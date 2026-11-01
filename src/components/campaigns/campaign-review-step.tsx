"use client";

import type { UseFormReturn } from "react-hook-form";

import type { useAudience } from "@/components/campaigns/use-campaigns";
import type { CampaignValues } from "@/components/campaigns/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";

import styles from "./campaign-review-step.module.scss";

export function CampaignReviewStep({ form, values: v, audience }: {
  form: UseFormReturn<CampaignValues>;
  values: CampaignValues;
  audience: ReturnType<typeof useAudience>["data"];
}) {
  return (
    <div className={styles.grid}>
      <dl className={styles.review}>
        <dt>Name</dt><dd className={styles.reviewName}>{v.name}</dd>
        <dt>Line of business</dt><dd>{PRODUCT_LABEL[v.product]}</dd>
        <dt>Audience</dt>
        <dd>{(audience?.total_targets ?? 0).toLocaleString("en-IN")} policies renewing within {v.renewal_within_days} days</dd>
        <dt>Languages</dt><dd>{v.languages.map((l) => LANGUAGE_LABEL[l]).join(", ")}</dd>
        <dt>Voice AI script</dt>
        <dd>{audience?.script ? `${audience.script.name} · v${audience.script.version} (latest approved)` : "No approved renewal script"}</dd>
        <dt>Calling window</dt><dd>09:00–19:00 IST</dd>
      </dl>
      <div className={styles.field}>
        <Label htmlFor="c-start">Start date (optional)</Label>
        <Input id="c-start" type="date" {...form.register("start_date")} />
        <p className={styles.hint}>
          {v.start_date ? `Dialling may start ${formatDate(v.start_date)} at 09:00 IST, once approved.` : "Leave empty to launch as soon as it is approved."}
        </p>
      </div>
    </div>
  );
}
