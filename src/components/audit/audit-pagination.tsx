"use client";

import { PAGE_SIZE } from "@/components/audit/use-audit";
import { Button } from "@/components/ui/button";

import styles from "./audit-pagination.module.scss";

export function AuditPagination({ page, total, onPageChange }: { page: number; total: number; onPageChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className={styles.pagination}>
      <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")}</span>
      <div className={styles.pager}>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <span>Page {page} of {pages}</span>
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
