"use client";

import { ACTION_LABEL, ACTION_TONE, ROLE_LABEL, TD, TH } from "@/components/admin/labels";
import type { AuditRow } from "@/components/audit/use-audit";
import { Pill } from "@/components/common/pill";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./audit-table.module.scss";

function detailText(detail: AuditRow["detail"]) {
  if (!detail) return "—";
  return Object.entries(detail).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" · ");
}

export function AuditTable({ rows, isLoading, isFetching, selectedId, onSelect }: {
  rows: AuditRow[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}) {
  return (
    <div className={cn(styles.tableWrap, isFetching && !isLoading && styles.refetching)}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr><th className={TH}>Time (IST)</th><th className={TH}>Actor</th><th className={TH}>Action</th><th className={TH}>Entity</th><th className={TH}>Detail</th></tr>
        </thead>
        <tbody className={styles.tbody}>
          {isLoading && Array.from({ length: 8 }, (_, i) => (
            <tr key={i}><td colSpan={5} className={TD}><Skeleton className={styles.skeletonRow} /></td></tr>
          ))}
          {rows?.map((r) => (
            <tr key={r.id} tabIndex={0} aria-selected={r.id === selectedId}
              onClick={() => onSelect(r.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(r.id); } }}
              className={cn(styles.row, r.id === selectedId && styles.rowSelected)}>
              <td className={cn(TD, styles.mono)}>{formatDateTime(r.ts)}</td>
              <td className={TD}>
                <span className={styles.actorName}>{r.actor_name ?? "Unknown"}</span>
                <span className={styles.actorRole}>{r.actor_role ? ROLE_LABEL[r.actor_role] : "Not signed in"}</span>
              </td>
              <td className={TD}><Pill tone={ACTION_TONE[r.action] ?? "neutral"}>{ACTION_LABEL[r.action]}</Pill></td>
              <td className={cn(TD, styles.mono)}>{r.entity_type ?? "—"}{r.entity_id ? ` #${r.entity_id}` : ""}</td>
              <td className={cn(TD, styles.detailCell)}>{detailText(r.detail)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
