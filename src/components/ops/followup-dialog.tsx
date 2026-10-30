"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { FOLLOWUP_KIND_LABEL } from "@/components/ops/tones";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

const KINDS: Schemas["FollowupKind"][] = ["callback", "reminder", "payment_link"];
const IST_OFFSET_MS = 330 * 60_000;

// <input type="datetime-local"> has no zone: we read and write it as IST wall-clock time.
const istLocal = (d: Date) => new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 16);
const fromIstLocal = (v: string) => new Date(`${v}:00+05:30`);

const schema = z.object({
  policyNo: z.string().trim().regex(/^[A-Za-z]{3}-\d{4}-\d{6}$/, "Enter a policy number like MOT-2026-001234"),
  kind: z.enum(["callback", "reminder", "payment_link"]),
  due: z.string().min(1, "Choose when it is due").refine((v) => !Number.isNaN(fromIstLocal(v).getTime()), "Choose a valid date and time"),
  reason: z.string().trim().min(3, "Add a short reason (at least 3 characters)").max(500),
});
type Values = z.infer<typeof schema>;

export function FollowupDialog({ policyNo, policyId, trigger }: { policyNo?: string; policyId?: number; trigger?: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: { policyNo: policyNo ?? "", kind: "callback", due: "", reason: "" },
  });
  const { errors, isSubmitting } = form.formState;

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setServerError(null);
      // Default a few minutes out so the 2-minute sandbox timer visibly sends it.
      form.reset({ policyNo: policyNo ?? "", kind: "callback", due: istLocal(new Date(Date.now() + 5 * 60_000)), reason: "" });
    }
  }

  async function onSubmit(v: Values) {
    setServerError(null);
    try {
      const id = policyId ?? (await unwrap(api.GET("/api/v1/policies/{policy_no}", {
        params: { path: { policy_no: v.policyNo.toUpperCase() } },
      }))).id;
      const due = fromIstLocal(v.due);
      await unwrap(api.POST("/api/v1/followups", { body: { policy_id: id, kind: v.kind, due_at: due.toISOString(), reason: v.reason } }));
      await queryClient.invalidateQueries({ queryKey: ["followups"] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success(`${FOLLOWUP_KIND_LABEL[v.kind]} scheduled for ${formatDateTime(due)}`);
      setOpen(false);
    } catch (e) {
      setServerError((e as Error).message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? <Button><CalendarPlus aria-hidden />Schedule follow-up</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-headline-md text-on-surface">Schedule follow-up</DialogTitle>
          <DialogDescription className="text-body-sm text-on-surface-variant">
            When it is due, the sandbox timer writes the WhatsApp message and marks it sent. Nothing reaches a real phone.
          </DialogDescription>
        </DialogHeader>
        <form id="followup-form" noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-space-lg">
          {serverError && (
            <div role="alert" className="flex items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fu-policy" className="text-label-md text-on-surface">Policy number</Label>
            <Input id="fu-policy" readOnly={!!policyNo} placeholder="MOT-2026-001234" aria-invalid={!!errors.policyNo}
              aria-describedby={errors.policyNo ? "fu-policy-error" : undefined} {...form.register("policyNo")} />
            {errors.policyNo && <p id="fu-policy-error" className="text-label-sm text-danger-text">{errors.policyNo.message}</p>}
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-label-md text-on-surface">Type</legend>
            <Controller control={form.control} name="kind" render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-3 gap-space-sm">
                {KINDS.map((k) => (
                  <Label key={k} htmlFor={`fu-${k}`} className="flex cursor-pointer items-center gap-space-sm rounded-lg border border-divider p-space-sm text-body-sm font-normal has-data-[state=checked]:border-primary-container has-data-[state=checked]:bg-surface-container-low">
                    <RadioGroupItem id={`fu-${k}`} value={k} />
                    {FOLLOWUP_KIND_LABEL[k]}
                  </Label>
                ))}
              </RadioGroup>
            )} />
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fu-due" className="text-label-md text-on-surface">Due (IST)</Label>
            <Input id="fu-due" type="datetime-local" aria-invalid={!!errors.due}
              aria-describedby={errors.due ? "fu-due-error" : undefined} {...form.register("due")} />
            {errors.due && <p id="fu-due-error" className="text-label-sm text-danger-text">{errors.due.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fu-reason" className="text-label-md text-on-surface">Reason</Label>
            <Textarea id="fu-reason" rows={3} aria-invalid={!!errors.reason}
              aria-describedby={errors.reason ? "fu-reason-error" : undefined} {...form.register("reason")} />
            {errors.reason && <p id="fu-reason-error" className="text-label-sm text-danger-text">{errors.reason.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="followup-form" disabled={isSubmitting}>
            {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
            {isSubmitting ? "Scheduling…" : "Schedule follow-up"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
