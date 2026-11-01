"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

export type AuditRow = Schemas["AuditRow"];
export type AuditFilters = { actor: string; action: Schemas["AuditAction"] | ""; entity_type: string; date_from: string; date_to: string };

export const EMPTY_FILTERS: AuditFilters = { actor: "", action: "", entity_type: "", date_from: "", date_to: "" };
export const PAGE_SIZE = 25;

// Only the filters that are set, in the shape the API expects.
const toQuery = (f: AuditFilters) => Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")) as Partial<Omit<AuditFilters, "action">> & { action?: Schemas["AuditAction"] };

export function useAuditLog(filters: AuditFilters, page: number) {
  return useQuery({
    queryKey: ["audit", filters, page],
    queryFn: () => unwrap(api.GET("/api/v1/audit", { params: { query: { ...toQuery(filters), page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useExportAudit(filters: AuditFilters) {
  const queryClient = useQueryClient();
  return useMutation({
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
}
