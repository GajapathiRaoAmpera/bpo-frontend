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
      <ol className="grid grid-cols-3 gap-space-sm" aria-label="Wizard steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}
            className={cn("flex items-center gap-space-sm rounded-lg border px-space-md py-space-sm text-label-md",
              i === step ? "border-primary bg-surface-container-low text-primary" : "border-divider text-on-surface-variant")}>
            <span className={cn("flex size-6 items-center justify-center rounded-full text-label-xs",
              i <= step ? "bg-primary text-on-primary" : "bg-surface-container-high")}>{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-space-lg">
        {step === 0 && (
          <div className="grid grid-cols-2 gap-space-lg">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-name">Campaign name</Label>
              <Input id="c-name" placeholder="e.g. December Motor Renewal Wave" aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "c-name-error" : undefined} {...form.register("name")} />
              {errors.name && <p id="c-name-error" className="text-label-sm text-danger-text">{errors.name.message}</p>}
            </div>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-label-md text-on-surface">Line of business</legend>
              <Controller control={form.control} name="product" render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-space-lg">
                  {PRODUCTS.map((p) => (
                    <div key={p} className="flex items-center gap-space-sm">
                      <RadioGroupItem id={`c-product-${p}`} value={p} />
                      <Label htmlFor={`c-product-${p}`} className="font-normal">{PRODUCT_LABEL[p]}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )} />
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-3 gap-space-lg">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-days">Renewal due within (days)</Label>
              <Input id="c-days" type="number" min={1} max={90} aria-invalid={!!errors.renewal_within_days}
                {...form.register("renewal_within_days", { valueAsNumber: true })} />
              {errors.renewal_within_days && <p className="text-label-sm text-danger-text">{errors.renewal_within_days.message}</p>}
            </div>
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-label-md text-on-surface">Preferred languages</legend>
              <Controller control={form.control} name="languages" render={({ field }) => (
                <div className="flex gap-space-lg">
                  {LANGUAGES.map((l) => (
                    <div key={l} className="flex items-center gap-space-sm">
                      <Checkbox id={`c-lang-${l}`} checked={field.value.includes(l)} onCheckedChange={(on) => {
                        field.onChange(on ? [...field.value, l] : field.value.filter((x) => x !== l));
                        field.onBlur();
                      }} />
                      <Label htmlFor={`c-lang-${l}`} className="font-normal">{LANGUAGE_LABEL[l]}</Label>
                    </div>
                  ))}
                </div>
              )} />
              {errors.languages && <p className="text-label-sm text-danger-text">{errors.languages.message}</p>}
            </fieldset>
            <div aria-live="polite" className="flex flex-col justify-center rounded-lg bg-surface-container-low p-space-md">
              <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">Matching policies</span>
              <span className="text-display text-primary">
                {audience.isFetching ? <Loader2 aria-label="Counting" className="size-6 animate-spin" /> : (audience.data?.total_targets ?? 0).toLocaleString("en-IN")}
              </span>
              <span className="text-label-sm text-on-surface-variant">{PRODUCT_LABEL[v.product]} policies, active or due, not lapsed</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-3 gap-space-lg">
            <dl className="col-span-2 grid grid-cols-2 gap-x-space-lg gap-y-space-sm rounded-lg border border-divider p-space-md text-body-sm">
              <dt className="text-on-surface-variant">Name</dt><dd className="text-label-md">{v.name}</dd>
              <dt className="text-on-surface-variant">Line of business</dt><dd>{PRODUCT_LABEL[v.product]}</dd>
              <dt className="text-on-surface-variant">Audience</dt>
              <dd>{(audience.data?.total_targets ?? 0).toLocaleString("en-IN")} policies renewing within {v.renewal_within_days} days</dd>
              <dt className="text-on-surface-variant">Languages</dt><dd>{v.languages.map((l) => LANGUAGE_LABEL[l]).join(", ")}</dd>
              <dt className="text-on-surface-variant">Voice AI script</dt>
              <dd>{audience.data?.script ? `${audience.data.script.name} · v${audience.data.script.version} (latest approved)` : "No approved renewal script"}</dd>
              <dt className="text-on-surface-variant">Calling window</dt><dd>09:00–19:00 IST</dd>
            </dl>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="c-start">Start date (optional)</Label>
              <Input id="c-start" type="date" {...form.register("start_date")} />
              <p className="text-label-sm text-on-surface-variant">
                {v.start_date ? `Dialling may start ${formatDate(v.start_date)} at 09:00 IST, once approved.` : "Leave empty to launch as soon as it is approved."}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-divider pt-space-md">
          <Button type="button" variant="outline" onClick={() => (step ? setStep(step - 1) : onClose())}>
            <ArrowLeft aria-hidden />{step ? "Back" : "Cancel"}
          </Button>
          {step < 2 ? (
            <Button type="button" onClick={next}>Continue<ArrowRight aria-hidden /></Button>
          ) : (
            <div className="flex gap-space-sm">
              <Button type="button" variant="outline" disabled={save.isPending}
                onClick={form.handleSubmit((values) => save.mutate({ values, submit: false }))}>
                <Save aria-hidden />Save draft
              </Button>
              <Button type="button" disabled={save.isPending || !audience.data?.total_targets}
                onClick={form.handleSubmit((values) => save.mutate({ values, submit: true }))}>
                {save.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Send aria-hidden />}Save and submit for approval
              </Button>
            </div>
          )}
        </div>
      </form>
    </Panel>
  );
}
