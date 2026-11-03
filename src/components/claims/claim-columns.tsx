"use client";

import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useMemo } from "react";

import { SELECT_CLASS } from "@/components/admin/labels";
import { Pill } from "@/components/common/pill";
import type { Features } from "@/components/ops/data-table";
import type { Schemas } from "@/lib/api";
import { formatDate } from "@/lib/format";

import styles from "./claim-columns.module.scss";
import { CLAIM_STATUS_LABEL, CLAIM_TONE, NEXT_STATUS } from "./utils";

type Row = Schemas["ClaimRow"];
const h = createColumnHelper<Features, Row>();

// Table columns for the claims list; the move-to column only exists for full access.
export function useClaimColumns({ canWrite, onMove, isPending }: {
  canWrite: boolean;
  onMove: (row: Row, to: Schemas["ClaimStatus"]) => void;
  isPending: boolean;
}) {
  return useMemo(() => h.columns([
    h.display({ id: "claim", header: "Claim no", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.claim_no}</span> }),
    h.display({ id: "customer", header: "Customer", cell: ({ row: { original: c } }) => (
      <div className={styles.stack}>
        <Link href={`/customers/${c.customer_id}`} className={styles.customerLink}>{c.customer_name}</Link>
        <span className={styles.mono}>{c.phone}</span>
      </div>
    ) }),
    h.display({ id: "policy", header: "Policy", cell: ({ row: { original: c } }) => (
      <div className={styles.stack}>
        <span className={styles.mono}>{c.policy_no}</span>
        <span className={styles.muted}>{c.plan_name}</span>
      </div>
    ) }),
    h.display({ id: "incident", header: "Incident date", cell: ({ row: { original: c } }) => <span className={styles.nowrap}>{formatDate(c.incident_date)}</span> }),
    h.display({ id: "description", header: "Description", cell: ({ row: { original: c } }) => <span className={styles.description} title={c.description}>{c.description}</span> }),
    h.display({ id: "status", header: "Status", cell: ({ row: { original: c } }) => <Pill tone={CLAIM_TONE[c.status]}>{CLAIM_STATUS_LABEL[c.status]}</Pill> }),
    ...(canWrite ? [h.display({ id: "actions", header: "Move to", cell: ({ row: { original: c } }) => (
      NEXT_STATUS[c.status].length ? (
        <select className={SELECT_CLASS} aria-label={`Move claim ${c.claim_no} to`} value="" disabled={isPending}
          onChange={(e) => onMove(c, e.target.value as Schemas["ClaimStatus"])}>
          <option value="" disabled>Choose status</option>
          {NEXT_STATUS[c.status].map((s) => <option key={s} value={s}>{CLAIM_STATUS_LABEL[s]}</option>)}
        </select>
      ) : null) })] : []),
  ]), [canWrite, onMove, isPending]);
}
