"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import type { PillTone } from "@/components/common/pill";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";

type Status = Schemas["CampaignStatus"]; // superset of ApprovalStatus

export const STATUS: Record<Status, { label: string; tone: PillTone }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending: { label: "Awaiting approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  running: { label: "Running", tone: "live" },
  completed: { label: "Completed", tone: "info" },
};

export const CHECK_LABEL: Record<string, string> = {
  ai_disclosure: "Discloses AI assistant and call recording",
  verification_before_details: "Verifies identity before sharing details",
  figures_from_tools_only: "States figures only from tool results",
  no_mis_selling: "No mis-selling or pressure",
  escalation_path: "Clear escalation to a human",
  calling_window: "Calls only inside 09:00–19:00 IST",
  dnd_scrubbed: "Audience scrubbed against DND registry",
  approved_script: "Uses the approved renewal script",
  segment_reviewed: "Segment and targeting reviewed",
};

export const MODE_LABEL: Record<Schemas["CallMode"], string> = { inbound: "Inbound service", renewal: "Renewal" };

export function Panel({ title, action, children, className }: {
  title: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`flex flex-col rounded-lg bg-surface-container-lowest shadow-card ${className ?? ""}`}>
      <div className="flex min-h-12 items-center justify-between gap-space-sm border-b border-divider px-space-md py-space-sm">
        <h2 className="text-headline-sm text-on-surface">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col gap-space-md p-space-md">{children}</div>
    </section>
  );
}

export function ErrorBox({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-space-md rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
      {error.message}
      {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/** Button that asks for confirmation naming the object before an approve/reject/launch/submit. */
export function Confirm({ label, icon, title, description, confirmLabel, onConfirm, busy, disabled, variant = "default", size }: {
  label: string;
  icon?: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown>;
  busy?: boolean;
  disabled?: boolean;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ai";
  size?: "sm" | "default" | "lg";
}) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={disabled || busy}>
          {busy ? <Loader2 aria-hidden className="animate-spin" /> : icon}
          {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant={variant === "outline" ? "default" : variant} disabled={busy}
            onClick={() => onConfirm().then(() => setOpen(false), () => undefined)}>
            {busy && <Loader2 aria-hidden className="animate-spin" />}
            {confirmLabel ?? label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
