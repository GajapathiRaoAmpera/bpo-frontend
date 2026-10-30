"use client";

import { type ColumnDef, type RowData, tableFeatures, useTable } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const right = (id: string) => numeric.includes(id) && "text-right";

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-between gap-space-md rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
        {error.message}
        {onRetry && <Button size="sm" variant="outline" onClick={onRetry}>Try again</Button>}
      </div>
    );
  }
  if (!isLoading && data?.length === 0) return <EmptyState {...empty} />;

  const pages = total && pageSize ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-table-head">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-divider">
                {group.headers.map((header) => (
                  <th key={header.id} scope="col" className={cn("h-9 px-space-md text-label-xs tracking-wider whitespace-nowrap text-on-surface-variant uppercase", right(header.column.id))}>
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => (
                <tr key={i} className="border-b border-divider last:border-0">
                  {columns.map((_, j) => <td key={j} className="h-12 px-space-md"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              ))
              : table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === "Enter") onRowClick(row.original); } : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  aria-label={rowLabel?.(row.original)}
                  className={cn("border-b border-divider last:border-0", onRowClick && "cursor-pointer outline-none hover:bg-table-head focus-visible:bg-surface-container-low")}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className={cn("h-12 px-space-md text-body-sm text-on-surface", right(cell.column.id))}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {onPage && page && total !== undefined && (
        <div className="flex items-center justify-between border-t border-divider px-space-md py-space-sm text-label-sm text-on-surface-variant">
          <span>{total.toLocaleString("en-IN")} {total === 1 ? "record" : "records"} · page {page} of {pages}</span>
          <div className="flex gap-space-xs">
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
