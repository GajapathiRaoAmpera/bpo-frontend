"use client";

import { type ColumnDef, type RowData, tableFeatures, useTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import styles from "./data-table.module.scss";

export const features = tableFeatures({});
export type Features = typeof features;

const EMPTY: never[] = [];

// Stitch table: 36px label-xs header on table-head, 48px rows with divider lines; server-side paging.
export function DataTable<T extends RowData>({
  columns, data, isLoading, error, onRetry, empty, onRowClick, rowLabel, numeric = [], page, pageSize, total, onPage,
}: {
  columns: ColumnDef<Features, T>[];
  data: T[] | undefined;
  isLoading: boolean;
  error?: Error | null;
  onRetry?: () => void;
  empty: { icon: LucideIcon; title: string; description: string; action?: React.ReactNode };
  onRowClick?: (row: T) => void;
  rowLabel?: (row: T) => string;
  numeric?: string[]; // column ids to right-align
  page?: number;
  pageSize?: number;
  total?: number;
  onPage?: (page: number) => void;
}) {
  const table = useTable({ features, columns, data: data ?? (EMPTY as T[]) });
  const right = (id: string) => numeric.includes(id) && styles.right;

  if (error) {
    return (
      <ErrorAlert onRetry={onRetry}>{error.message}</ErrorAlert>
    );
  }
  if (!isLoading && data?.length === 0) return <EmptyState {...empty} />;

  const pages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return (
    <div className={styles.card}>
      <div className={styles.scroll}>
        <table className={styles.table}>
          <thead className={styles.head}>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className={styles.headRow}>
                {group.headers.map((header) => (
                  <th key={header.id} scope="col" className={cn(styles.th, right(header.column.id))}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                <tr key={i} className={styles.row}>
                  {columns.map((_, j) => <td key={j} className={styles.skeletonCell}><Skeleton className={styles.bone} /></td>)}
                </tr>
              ))
              : table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row.original); } : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={rowLabel?.(row.original)}
                  className={cn(styles.row, onRowClick && styles.clickable)}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className={cn(styles.td, right(cell.column.id))}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {onPage && page && total !== undefined && (
        <div className={styles.footer}>
          <span>{total.toLocaleString("en-IN")} {total === 1 ? "record" : "records"} · page {page} of {pages}</span>
          <div className={styles.pager}>
            <Button size="icon-sm" variant="outline" aria-label="Previous page" disabled={page <= 1 || isLoading} onClick={() => onPage(page - 1)}>
              <ChevronLeft aria-hidden />
            </Button>
            <Button size="icon-sm" variant="outline" aria-label="Next page" disabled={page >= pages || isLoading} onClick={() => onPage(page + 1)}>
              <ChevronRight aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
