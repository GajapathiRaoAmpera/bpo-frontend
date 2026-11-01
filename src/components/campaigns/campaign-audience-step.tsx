"use client";

import { Loader2 } from "lucide-react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { type CampaignValues, LANGUAGES } from "@/components/campaigns/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";

import styles from "./campaign-audience-step.module.scss";

export function CampaignAudienceStep({ form, product, counting, total }: {
  form: UseFormReturn<CampaignValues>;
  product: CampaignValues["product"];
  counting: boolean;
  total: number | undefined;
}) {
  const { errors } = form.formState;
  return (
    <div className={styles.grid}>
      <div className={styles.field}>
        <Label htmlFor="c-days">Renewal due within (days)</Label>
        <Input id="c-days" type="number" min={1} max={90} aria-invalid={!!errors.renewal_within_days}
          {...form.register("renewal_within_days", { valueAsNumber: true })} />
        {errors.renewal_within_days && <p className={styles.error}>{errors.renewal_within_days.message}</p>}
      </div>
      <fieldset className={styles.field}>
        <legend className={styles.legend}>Preferred languages</legend>
        <Controller control={form.control} name="languages" render={({ field }) => (
          <div className={styles.options}>
            {LANGUAGES.map((l) => (
              <div key={l} className={styles.option}>
                <Checkbox id={`c-lang-${l}`} checked={field.value.includes(l)} onCheckedChange={(on) => {
                  field.onChange(on ? [...field.value, l] : field.value.filter((x) => x !== l));
                  field.onBlur();
                }} />
                <Label htmlFor={`c-lang-${l}`} className={styles.optionLabel}>{LANGUAGE_LABEL[l]}</Label>
              </div>
            ))}
          </div>
        )} />
        {errors.languages && <p className={styles.error}>{errors.languages.message}</p>}
      </fieldset>
      <div aria-live="polite" className={styles.audience}>
        <span className={styles.eyebrow}>Matching policies</span>
        <span className={styles.count}>
          {counting ? <Loader2 aria-label="Counting" className={styles.counting} /> : (total ?? 0).toLocaleString("en-IN")}
        </span>
        <span className={styles.hint}>{PRODUCT_LABEL[product]} policies, active or due, not lapsed</span>
      </div>
    </div>
  );
}
