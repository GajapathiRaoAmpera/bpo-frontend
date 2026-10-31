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
import { cn } from "@/lib/utils";

import styles from "./shared.module.scss";

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
    <section className={cn(styles.panel, className)}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>{title}</h2>
        {action}
      </div>
      <div className={styles.panelBody}>{children}</div>
    </section>
  );
}

export function ErrorBox({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div role="alert" className={styles.error}>
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
          {busy ? <Loader2 aria-hidden className={styles.spinner} /> : icon}
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
            {busy && <Loader2 aria-hidden className={styles.spinner} />}
            {confirmLabel ?? label}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
