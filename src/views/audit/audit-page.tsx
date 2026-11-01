"use client";

import { Download, FileSearch, Loader2, Lock, ScrollText } from "lucide-react";
import { useState } from "react";

import { AuditDetailPanel } from "@/components/audit/audit-detail-panel";
import { AuditFilters } from "@/components/audit/audit-filters";
import { AuditPagination } from "@/components/audit/audit-pagination";
import { AuditTable } from "@/components/audit/audit-table";
import { type AuditFilters as Filters, EMPTY_FILTERS, useAuditLog, useExportAudit } from "@/components/audit/use-audit";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";

import styles from "./audit-page.module.scss";

export function AuditPage() {
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useAuditLog(filters, page);
  const exportCsv = useExportAudit(filters);

  function apply(next: Filters) {
    setFilters(next);
    setPage(1);
    setSelectedId(null);
  }
  const reset = () => { setDraft(EMPTY_FILTERS); apply(EMPTY_FILTERS); };

  const total = data?.total ?? 0;
  const filtered = Object.values(filters).some(Boolean);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Audit Log"
        badge={<Pill tone="live"><Lock aria-hidden className={styles.lockIcon} /> Append-only</Pill>}
        description="Every sign-in, customer-data view, change, approval, takeover and export. Entries can't be edited or deleted; exports are themselves recorded."
        actions={
          <Button onClick={() => exportCsv.mutate()} disabled={exportCsv.isPending || total === 0}>
            {exportCsv.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Download aria-hidden />}
            {exportCsv.isPending ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />

      <div className={styles.layout}>
        <section aria-labelledby="ledger-heading" className={styles.ledger}>
          <div className={styles.ledgerHeader}>
            <ScrollText aria-hidden className={styles.ledgerIcon} />
            <h2 id="ledger-heading" className={styles.heading}>Audit ledger</h2>
            {data && <Pill tone="info">{total.toLocaleString("en-IN")} entries</Pill>}
          </div>

          <AuditFilters draft={draft} onDraftChange={setDraft} onApply={() => apply(draft)} onReset={reset} filtered={filtered} />

          {error && <ErrorAlert layout="stacked" onRetry={() => refetch()}>{error.message}</ErrorAlert>}

          {data?.items.length === 0 ? (
            <EmptyState icon={FileSearch} title={filtered ? "No entries match these filters" : "No audit entries yet"}
              description={filtered ? "Widen the date range or clear a filter." : "Entries appear as people sign in and work."}
              action={filtered ? <Button variant="outline" onClick={reset}>Reset filters</Button> : undefined} />
          ) : (
            <AuditTable rows={data?.items} isLoading={isLoading} isFetching={isFetching} selectedId={selectedId} onSelect={setSelectedId} />
          )}

          {data && total > 0 && <AuditPagination page={page} total={total} onPageChange={setPage} />}
        </section>

        <div className={styles.side}>
          <AuditDetailPanel row={data?.items.find((r) => r.id === selectedId)} />
        </div>
      </div>
    </div>
  );
}
