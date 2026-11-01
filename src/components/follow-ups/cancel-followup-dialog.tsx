"use client";

import { FOLLOWUP_KIND_LABEL } from "@/components/ops/tones";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

export function CancelFollowupDialog({ followup: f, onClose, onConfirm }: {
  followup: Schemas["FollowupRow"] | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
}) {
  return (
    <AlertDialog open={f !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {f && FOLLOWUP_KIND_LABEL[f.kind].toLowerCase()} for {f?.customer_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            The {f && formatDateTime(f.due_at)} follow-up on {f?.policy_no} won&apos;t be sent. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep follow-up</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => f && onConfirm(f.id)}>Cancel follow-up</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
