"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import type { CampaignValues } from "@/components/campaigns/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Schemas } from "@/lib/api";
import { PRODUCT_LABEL } from "@/lib/labels";

import styles from "./campaign-details-step.module.scss";

const PRODUCTS = Object.keys(PRODUCT_LABEL) as Schemas["Product"][];

export function CampaignDetailsStep({ form }: { form: UseFormReturn<CampaignValues> }) {
  const { errors } = form.formState;
  return (
    <div className={styles.grid}>
      <div className={styles.field}>
        <Label htmlFor="c-name">Campaign name</Label>
        <Input id="c-name" placeholder="e.g. December Motor Renewal Wave" aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "c-name-error" : undefined} {...form.register("name")} />
        {errors.name && <p id="c-name-error" className={styles.error}>{errors.name.message}</p>}
      </div>
      <fieldset className={styles.field}>
        <legend className={styles.legend}>Line of business</legend>
        <Controller control={form.control} name="product" render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange} className={styles.options}>
            {PRODUCTS.map((p) => (
              <div key={p} className={styles.option}>
                <RadioGroupItem id={`c-product-${p}`} value={p} />
                <Label htmlFor={`c-product-${p}`} className={styles.optionLabel}>{PRODUCT_LABEL[p]}</Label>
              </div>
            ))}
          </RadioGroup>
        )} />
      </fieldset>
    </div>
  );
}
