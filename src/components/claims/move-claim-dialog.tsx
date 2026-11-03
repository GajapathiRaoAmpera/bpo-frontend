"use client";

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Schemas } from "@/lib/api";

import { CLAIM_STATUS_LABEL } from "./utils";

export type ClaimMove = { claim: Schemas["ClaimRow"]; to: Schemas["ClaimStatus"] };

export function MoveClaimDialog({ move, onClose, onConfirm }: {
  move: ClaimMove | null;
  onClose: () => void;
  onConfirm: (move: ClaimMove) => void;
}) {
  const label = move ? CLAIM_STATUS_LABEL[move.to].toLowerCase() : "";
  const final = move?.to === "rejected" || move?.to === "settled";
  return (
    <AlertDialog open={move !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark claim {move?.claim.claim_no} {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            {move?.claim.customer_name}&apos;s claim on {move?.claim.policy_no} moves to {label}.
            {final && " This is final and can't be changed later."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep as is</AlertDialogCancel>
          <AlertDialogAction variant={move?.to === "rejected" ? "destructive" : "default"} onClick={() => move && onConfirm(move)}>
            Mark {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
