"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Search, ShieldAlert, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { DataTable, type Features } from "@/components/ops/data-table";
import { useLevel } from "@/components/ops/use-level";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { LANGUAGE_LABEL } from "@/lib/labels";

type Row = Schemas["CustomerRow"];
const h = createColumnHelper<Features, Row>();
const columns = h.columns([
  h.display({ id: "name", header: "Customer", cell: ({ row: { original: c } }) => (
    <div className="flex flex-col">
      <span className="text-label-md">{c.full_name}</span>
      <span className="text-data-mono text-label-xs text-on-surface-variant">{c.customer_code}</span>
    </div>
  ) }),
  h.display({ id: "phone", header: "Mobile", cell: ({ row: { original: c } }) => <span className="text-data-mono">{c.phone}</span> }),
  h.display({ id: "city", header: "Location", cell: ({ row: { original: c } }) => `${c.city}, ${c.state}` }),
  h.display({ id: "lang", header: "Language", cell: ({ row: { original: c } }) => <Pill tone="lang">{LANGUAGE_LABEL[c.preferred_language]}</Pill> }),
  h.display({ id: "policies", header: "Policies", cell: ({ row: { original: c } }) => <span className="text-data-mono">{c.policy_count}</span> }),
  h.display({ id: "renewal", header: "Next renewal", cell: ({ row: { original: c } }) => (c.next_renewal ? formatDate(c.next_renewal) : "—") }),
]);
const PAGE_SIZE = 25;

export function CustomersTable() {
  const router = useRouter();
  const masked = useLevel("customers") === "masked";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const query = useDeferredValue(q.trim());
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["customers", { query, page }],
    queryFn: () => unwrap(api.GET("/api/v1/customers", { params: { query: { q: query || null, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Customers & Policies"
        badge={masked ? <Pill tone="warning"><ShieldAlert aria-hidden className="size-3" />Masked view</Pill> : undefined}
        description="Customer 360: policies, renewals, calls and follow-ups for each policyholder. Opening a customer is recorded in the audit log."
      />
      <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-lowest p-space-md shadow-card">
        <Label htmlFor="cust-q" className="text-label-md text-on-surface">Search customers</Label>
        <div className="relative max-w-md">
          <Search aria-hidden className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-outline" />
          <Input id="cust-q" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className="pl-9"
            placeholder={masked ? "Name, customer code or policy no." : "Name, mobile, customer code or policy no."} />
        </div>
        {masked && <p className="text-label-sm text-on-surface-variant">Your role sees masked mobile numbers and email, no date of birth, and can&apos;t search by mobile.</p>}
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        numeric={["policies"]}
        onRowClick={(c) => router.push(`/customers/${c.id}`)}
        rowLabel={(c) => `Open ${c.full_name}`}
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total}
        onPage={setPage}
        empty={{ icon: Users, title: query ? "No customers match your search" : "No customers yet", description: query ? "Check the spelling or try a policy number." : "Run make reset in the backend to load the sandbox data." }}
      />
    </div>
  );
}
