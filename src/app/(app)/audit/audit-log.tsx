"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, FileSearch, Loader2, Lock, ScrollText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ACTION_LABEL, ACTION_TONE, ROLE_LABEL, SELECT_CLASS, TD, TH } from "@/components/admin/labels";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./audit-log.module.scss";

type Row = Schemas["AuditRow"];
type Filters = { actor: string; action: Schemas["AuditAction"] | ""; entity_type: string; date_from: string; date_to: string };

const EMPTY: Filters = { actor: "", action: "", entity_type: "", date_from: "", date_to: "" };
const PAGE_SIZE = 25;

// Only the filters that are set, in the shape the API expects.
const toQuery = (f: Filters) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")) as Partial<Omit<Filters, "action">> & { action?: Schemas["AuditAction"] };

function detailText(detail: Row["detail"]) {
  if (!detail) return "—";
  return Object.entries(detail).map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`).join(" · ");
}

function DetailPanel({ row }: { row: Row | undefined }) {
  if (!row) {
    return (
      <div className={styles.placeholder}>
        <FileSearch aria-hidden className={styles.placeholderIcon} />
        <p className={styles.placeholderTitle}>Select an entry</p>
        <p className={styles.placeholderText}>Its full record appears here.</p>
      </div>
    );
  }
  const fields: [string, string][] = [
    ["Timestamp (IST)", formatDateTime(row.ts)],
    ["Timestamp (UTC)", row.ts],
    ["Actor", row.actor_name ?? "Unknown / signed out"],
    ["Role", row.actor_role ? ROLE_LABEL[row.actor_role] : "—"],
    ["Entity", row.entity_type ? `${row.entity_type}${row.entity_id ? ` #${row.entity_id}` : ""}` : "—"],
    ["IP address", row.ip ?? "—"],
  ];
  return (
    <aside aria-label="Audit entry" className={styles.detail}>
      <div className={styles.detailHeader}>
        <span className={styles.eyebrow}>Entry #{row.id}</span>
        <Pill tone="live"><Lock aria-hidden className={styles.lockIcon} /> Append-only</Pill>
      </div>
      <h2 className={styles.heading}>{ACTION_LABEL[row.action]}</h2>
      <dl className={styles.fields}>
        {fields.map(([k, v]) => (
          <div key={k} className={styles.fieldRow}>
            <dt className={styles.fieldKey}>{k}</dt>
            <dd className={styles.fieldValue}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.detailBlock}>
        <span className={styles.eyebrow}>Detail</span>
        <pre className={styles.raw}>
          {row.detail ? JSON.stringify(row.detail, null, 2) : "No extra detail recorded."}
        </pre>
      </div>
    </aside>
  );
}

export function AuditLog() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["audit", filters, page],
    queryFn: () => unwrap(api.GET("/api/v1/audit", { params: { query: { ...toQuery(filters), page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });

  const exportCsv = useMutation({
    mutationFn: async () => {
      const blob = await unwrap(api.GET("/api/v1/audit/export.csv", { params: { query: toQuery(filters) }, parseAs: "blob" })) as Blob;
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), { href: url, download: `assurevoice-audit-${new Date().toISOString().slice(0, 10)}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast.success("Audit log exported. The export itself is now on record.");
      void queryClient.invalidateQueries({ queryKey: ["audit"] });
    },
    onError: (e) => toast.error(e.message),
  });

  function apply(next: Filters) {
    setFilters(next);
    setPage(1);
    setSelectedId(null);
  }

  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft({ ...draft, [k]: e.target.value });
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
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

          <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); apply(draft); }}>
            <div className={styles.field}>
              <Label htmlFor="f-actor" className={styles.eyebrow}>Actor</Label>
              <Input id="f-actor" value={draft.actor} onChange={set("actor")} placeholder="Name or email" maxLength={80} />
            </div>
            <div className={styles.field}>
              <Label htmlFor="f-action" className={styles.eyebrow}>Action</Label>
              <select id="f-action" className={SELECT_CLASS} value={draft.action} onChange={set("action")}>
                <option value="">All actions</option>
                {(Object.keys(ACTION_LABEL) as Schemas["AuditAction"][]).map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <Label htmlFor="f-entity" className={styles.eyebrow}>Entity</Label>
              <Input id="f-entity" value={draft.entity_type} onChange={set("entity_type")} placeholder="e.g. customer" maxLength={40} />
            </div>
            <div className={styles.field}>
              <Label htmlFor="f-from" className={styles.eyebrow}>From (IST)</Label>
              <Input id="f-from" type="date" value={draft.date_from} onChange={set("date_from")} />
            </div>
            <div className={styles.field}>
              <Label htmlFor="f-to" className={styles.eyebrow}>To (IST)</Label>
              <Input id="f-to" type="date" value={draft.date_to} min={draft.date_from || undefined} onChange={set("date_to")} />
            </div>
            <div className={styles.filterActions}>
              <Button type="button" variant="outline" onClick={() => { setDraft(EMPTY); apply(EMPTY); }} disabled={!filtered}>Reset filters</Button>
              <Button type="submit">Apply filters</Button>
            </div>
          </form>

          {error && (
            <div role="alert" className={styles.error}>
              {error.message}
              <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {data?.items.length === 0 ? (
            <EmptyState icon={FileSearch} title={filtered ? "No entries match these filters" : "No audit entries yet"}
              description={filtered ? "Widen the date range or clear a filter." : "Entries appear as people sign in and work."}
              action={filtered ? <Button variant="outline" onClick={() => { setDraft(EMPTY); apply(EMPTY); }}>Reset filters</Button> : undefined} />
          ) : (
            <div className={cn(styles.tableWrap, isFetching && !isLoading && styles.refetching)}>
              <table className={styles.table}>
                <thead className={styles.thead}>
                  <tr><th className={TH}>Time (IST)</th><th className={TH}>Actor</th><th className={TH}>Action</th><th className={TH}>Entity</th><th className={TH}>Detail</th></tr>
                </thead>
                <tbody className={styles.tbody}>
                  {isLoading && Array.from({ length: 8 }, (_, i) => (
                    <tr key={i}><td colSpan={5} className={TD}><Skeleton className={styles.skeletonRow} /></td></tr>
                  ))}
                  {data?.items.map((r) => (
                    <tr key={r.id} tabIndex={0} aria-selected={r.id === selectedId}
                      onClick={() => setSelectedId(r.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(r.id); } }}
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
          )}

          {data && total > 0 && (
            <div className={styles.pagination}>
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")}</span>
              <div className={styles.pager}>
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span>Page {page} of {pages}</span>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </section>

        <div className={styles.side}>
          <DetailPanel row={data?.items.find((r) => r.id === selectedId)} />
        </div>
      </div>
    </div>
  );
}
