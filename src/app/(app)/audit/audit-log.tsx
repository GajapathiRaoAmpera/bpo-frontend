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
      <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-xl text-center shadow-card">
        <FileSearch aria-hidden className="size-6 text-primary-container" />
        <p className="text-label-md text-on-surface">Select an entry</p>
        <p className="text-body-sm text-on-surface-variant">Its full record appears here.</p>
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
    <aside aria-label="Audit entry" className="flex flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card">
      <div className="flex items-center justify-between gap-space-sm">
        <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">Entry #{row.id}</span>
        <Pill tone="live"><Lock aria-hidden className="size-3" /> Append-only</Pill>
      </div>
      <h2 className="text-headline-md text-on-surface">{ACTION_LABEL[row.action]}</h2>
      <dl className="flex flex-col gap-space-sm rounded-lg bg-surface-container-low/60 p-space-md text-body-sm">
        {fields.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-space-md">
            <dt className="text-on-surface-variant">{k}</dt>
            <dd className="text-right text-data-mono break-all text-on-surface">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-space-xs">
        <span className="text-label-xs tracking-wider text-on-surface-variant uppercase">Detail</span>
        <pre className="max-h-64 overflow-auto rounded-lg border border-divider bg-table-head p-space-md text-data-mono whitespace-pre-wrap text-on-surface">
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
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Audit Log"
        badge={<Pill tone="live"><Lock aria-hidden className="size-3" /> Append-only</Pill>}
        description="Every sign-in, customer-data view, change, approval, takeover and export. Entries can't be edited or deleted; exports are themselves recorded."
        actions={
          <Button onClick={() => exportCsv.mutate()} disabled={exportCsv.isPending || total === 0}>
            {exportCsv.isPending ? <Loader2 aria-hidden className="animate-spin" /> : <Download aria-hidden />}
            {exportCsv.isPending ? "Exporting…" : "Export CSV"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-space-xl xl:grid-cols-12">
        <section aria-labelledby="ledger-heading" className="flex min-w-0 flex-col gap-space-md rounded-lg bg-surface-container-lowest p-space-lg shadow-card xl:col-span-8">
          <div className="flex items-center gap-space-sm">
            <ScrollText aria-hidden className="size-5 text-primary" />
            <h2 id="ledger-heading" className="text-headline-md text-on-surface">Audit ledger</h2>
            {data && <Pill tone="info">{total.toLocaleString("en-IN")} entries</Pill>}
          </div>

          <form className="grid grid-cols-2 gap-space-md lg:grid-cols-5" onSubmit={(e) => { e.preventDefault(); apply(draft); }}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-actor" className="text-label-xs tracking-wider text-on-surface-variant uppercase">Actor</Label>
              <Input id="f-actor" value={draft.actor} onChange={set("actor")} placeholder="Name or email" maxLength={80} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-action" className="text-label-xs tracking-wider text-on-surface-variant uppercase">Action</Label>
              <select id="f-action" className={SELECT_CLASS} value={draft.action} onChange={set("action")}>
                <option value="">All actions</option>
                {(Object.keys(ACTION_LABEL) as Schemas["AuditAction"][]).map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-entity" className="text-label-xs tracking-wider text-on-surface-variant uppercase">Entity</Label>
              <Input id="f-entity" value={draft.entity_type} onChange={set("entity_type")} placeholder="e.g. customer" maxLength={40} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-from" className="text-label-xs tracking-wider text-on-surface-variant uppercase">From (IST)</Label>
              <Input id="f-from" type="date" value={draft.date_from} onChange={set("date_from")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="f-to" className="text-label-xs tracking-wider text-on-surface-variant uppercase">To (IST)</Label>
              <Input id="f-to" type="date" value={draft.date_to} min={draft.date_from || undefined} onChange={set("date_to")} />
            </div>
            <div className="col-span-full flex justify-end gap-space-sm">
              <Button type="button" variant="outline" onClick={() => { setDraft(EMPTY); apply(EMPTY); }} disabled={!filtered}>Reset filters</Button>
              <Button type="submit">Apply filters</Button>
            </div>
          </form>

          {error && (
            <div role="alert" className="flex flex-col items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
              {error.message}
              <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
            </div>
          )}

          {data?.items.length === 0 ? (
            <EmptyState icon={FileSearch} title={filtered ? "No entries match these filters" : "No audit entries yet"}
              description={filtered ? "Widen the date range or clear a filter." : "Entries appear as people sign in and work."}
              action={filtered ? <Button variant="outline" onClick={() => { setDraft(EMPTY); apply(EMPTY); }}>Reset filters</Button> : undefined} />
          ) : (
            <div className={cn("overflow-x-auto rounded-lg border border-divider", isFetching && !isLoading && "opacity-70")}>
              <table className="w-full text-body-sm">
                <thead className="bg-table-head">
                  <tr><th className={TH}>Time (IST)</th><th className={TH}>Actor</th><th className={TH}>Action</th><th className={TH}>Entity</th><th className={TH}>Detail</th></tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {isLoading && Array.from({ length: 8 }, (_, i) => (
                    <tr key={i}><td colSpan={5} className={TD}><Skeleton className="h-8" /></td></tr>
                  ))}
                  {data?.items.map((r) => (
                    <tr key={r.id} tabIndex={0} aria-selected={r.id === selectedId}
                      onClick={() => setSelectedId(r.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedId(r.id); } }}
                      className={cn("h-12 cursor-pointer hover:bg-table-head focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lang-border", r.id === selectedId && "bg-surface-container-low")}>
                      <td className={cn(TD, "text-data-mono whitespace-nowrap")}>{formatDateTime(r.ts)}</td>
                      <td className={TD}>
                        <span className="block text-label-md text-on-surface">{r.actor_name ?? "Unknown"}</span>
                        <span className="text-label-sm text-on-surface-variant">{r.actor_role ? ROLE_LABEL[r.actor_role] : "Not signed in"}</span>
                      </td>
                      <td className={TD}><Pill tone={ACTION_TONE[r.action] ?? "neutral"}>{ACTION_LABEL[r.action]}</Pill></td>
                      <td className={cn(TD, "text-data-mono whitespace-nowrap")}>{r.entity_type ?? "—"}{r.entity_id ? ` #${r.entity_id}` : ""}</td>
                      <td className={cn(TD, "max-w-72 truncate text-on-surface-variant")}>{detailText(r.detail)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {data && total > 0 && (
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
              <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString("en-IN")}</span>
              <div className="flex items-center gap-space-sm">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <span>Page {page} of {pages}</span>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </section>

        <div className="xl:col-span-4">
          <DetailPanel row={data?.items.find((r) => r.id === selectedId)} />
        </div>
      </div>
    </div>
  );
}
