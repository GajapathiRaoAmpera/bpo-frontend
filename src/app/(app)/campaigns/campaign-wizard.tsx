"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2, Save, Send, X } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Panel } from "@/components/maker-checker/shared";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./campaign-wizard.module.scss";

const PRODUCTS = Object.keys(PRODUCT_LABEL) as Schemas["Product"][];
const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Schemas["Language"][];
const STEPS = ["Campaign details", "Audience", "Review & schedule"] as const;

const schema = z.object({
  name: z.string().trim().min(3, "Give the campaign a name of at least 3 characters").max(160),
  product: z.enum(["motor", "health", "term_life"]),
  renewal_within_days: z.number({ error: "Enter a number of days" }).int().min(1, "At least 1 day").max(90, "At most 90 days"),
  languages: z.array(z.enum(["english", "tamil", "hindi"])).min(1, "Choose at least one language"),
  start_date: z.string(),
});
type Values = z.infer<typeof schema>;

// Calls start at the opening of the 09:00 IST calling window on the chosen day.
const toScheduled = (d: string) => (d ? `${d}T09:00:00+05:30` : null);
const istDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(iso));

export function CampaignWizard({ campaign, onClose, onSaved }: {
  campaign: Schemas["CampaignOut"] | null;
  onClose: () => void;
  onSaved: (c: Schemas["CampaignOut"], submitted: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const seg = campaign?.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] } | undefined;
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: campaign?.name ?? "",
      product: campaign?.product ?? "motor",
      renewal_within_days: seg?.renewal_within_days ?? 30,
      languages: seg?.languages ?? [...LANGUAGES],
      start_date: campaign?.scheduled_at ? istDay(campaign.scheduled_at) : "",
    },
  });
  const { errors } = form.formState;
  const v = useWatch({ control: form.control }) as Values;

  const audience = useQuery({
    queryKey: ["campaigns", "audience", v.product, v.renewal_within_days, v.languages.join(",")],
    queryFn: () => unwrap(api.GET("/api/v1/campaigns/audience", {
      params: { query: { product: v.product, renewal_within_days: v.renewal_within_days, languages: v.languages } },
    })),
    enabled: step > 0 && v.languages.length > 0 && v.renewal_within_days >= 1 && v.renewal_within_days <= 90,
  });

  const save = useMutation({
    mutationFn: async ({ values, submit }: { values: Values; submit: boolean }) => {
      const body = {
        name: values.name, product: values.product, scheduled_at: toScheduled(values.start_date),
        segment: { renewal_within_days: values.renewal_within_days, languages: values.languages },
      };
      let saved = campaign
        ? await unwrap(api.PATCH("/api/v1/campaigns/{campaign_id}", { params: { path: { campaign_id: campaign.id } }, body }))
        : await unwrap(api.POST("/api/v1/campaigns", { body }));
      if (submit) saved = await unwrap(api.POST("/api/v1/campaigns/{campaign_id}/submit", { params: { path: { campaign_id: saved.id } } }));
      return { saved, submit };
    },
    onSuccess: ({ saved, submit }) => onSaved(saved, submit),
    onError: (e) => toast.error(e.message),
  });

  async function next() {
    const fields: (keyof Values)[][] = [["name", "product"], ["renewal_within_days", "languages"]];
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
        {step === 0 && (
          <div className={styles.grid2}>
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
        )}

        {step === 1 && (
          <div className={styles.grid3}>
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
                {audience.isFetching ? <Loader2 aria-label="Counting" className={styles.counting} /> : (audience.data?.total_targets ?? 0).toLocaleString("en-IN")}
              </span>
              <span className={styles.hint}>{PRODUCT_LABEL[v.product]} policies, active or due, not lapsed</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.grid3}>
            <dl className={styles.review}>
              <dt>Name</dt><dd className={styles.reviewName}>{v.name}</dd>
              <dt>Line of business</dt><dd>{PRODUCT_LABEL[v.product]}</dd>
              <dt>Audience</dt>
              <dd>{(audience.data?.total_targets ?? 0).toLocaleString("en-IN")} policies renewing within {v.renewal_within_days} days</dd>
              <dt>Languages</dt><dd>{v.languages.map((l) => LANGUAGE_LABEL[l]).join(", ")}</dd>
              <dt>Voice AI script</dt>
              <dd>{audience.data?.script ? `${audience.data.script.name} · v${audience.data.script.version} (latest approved)` : "No approved renewal script"}</dd>
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
        )}

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
