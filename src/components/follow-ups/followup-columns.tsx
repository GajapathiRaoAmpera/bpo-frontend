"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Bot, Check, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Pill } from "@/components/common/pill";
import type { Features } from "@/components/ops/data-table";
import { FOLLOWUP_KIND_LABEL, FOLLOWUP_STATUS_LABEL, FOLLOWUP_TONE } from "@/components/ops/tones";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import styles from "./followup-columns.module.scss";

type Row = Schemas["FollowupRow"];
const h = createColumnHelper<Features, Row>();

// Table columns for the follow-ups list; the actions column only exists for writers.
export function useFollowupColumns({ canWrite, onDone, onCancel, isPending }: {
  canWrite: boolean;
  onDone: (id: number) => void;
  onCancel: (row: Row) => void;
  isPending: boolean;
}) {
  return useMemo(() => h.columns([
    h.display({ id: "customer", header: "Customer", cell: ({ row: { original: f } }) => (
      <div className={styles.customer}>
        <Link href={`/customers/${f.customer_id}`} className={styles.customerLink}>{f.customer_name}</Link>
        <span className={styles.policyNo}>{f.policy_no}</span>
      </div>
    ) }),
    h.display({ id: "kind", header: "Type", cell: ({ row: { original: f } }) => FOLLOWUP_KIND_LABEL[f.kind] }),
    h.display({ id: "due", header: "Due", cell: ({ row: { original: f } }) => <span className={styles.due}>{formatDateTime(f.due_at)}</span> }),
    h.display({ id: "status", header: "Status", cell: ({ row: { original: f } }) => <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill> }),
    h.display({ id: "message", header: "WhatsApp message", cell: ({ row: { original: f } }) => (f.message_text
      ? <span className={styles.message}><MessageCircle aria-hidden className={styles.messageIcon} /><span className={styles.messageText} title={f.message_text}>{f.message_text}</span></span>
      : <span className={styles.reason}>{f.reason}</span>) }),
    h.display({ id: "by", header: "Created by", cell: ({ row: { original: f } }) => (f.created_by_name ?? <span className={styles.aiAgent}><Bot aria-hidden className={styles.aiIcon} />AI agent</span>) }),
    ...(canWrite ? [h.display({ id: "actions", header: "Actions", cell: ({ row: { original: f } }) => (
      f.status === "scheduled" || f.status === "sent" ? (
        <div className={styles.rowActions}>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => onDone(f.id)}><Check aria-hidden />Mark done</Button>
          {f.status === "scheduled" && <Button size="sm" variant="ghost" onClick={() => onCancel(f)}><X aria-hidden />Cancel</Button>}
        </div>
      ) : null) })] : []),
  ]), [canWrite, onDone, onCancel, isPending]);
}
