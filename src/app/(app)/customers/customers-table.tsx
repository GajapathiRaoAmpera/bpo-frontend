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
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./customers-table.module.scss";

type Row = Schemas["CustomerRow"];
const h = createColumnHelper<Features, Row>();
const columns = h.columns([
  h.display({ id: "name", header: "Customer", cell: ({ row: { original: c } }) => (
    <div className={styles.stack}>
      <span className={styles.name}>{c.full_name}</span>
      <span className={styles.code}>{c.customer_code}</span>
    </div>
  ) }),
  h.display({ id: "phone", header: "Mobile", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.phone}</span> }),
  h.display({ id: "city", header: "Location", cell: ({ row: { original: c } }) => `${c.city}, ${c.state}` }),
  h.display({ id: "lang", header: "Language", cell: ({ row: { original: c } }) => <Pill tone="lang">{LANGUAGE_LABEL[c.preferred_language]}</Pill> }),
  h.display({ id: "policies", header: "Policies", cell: ({ row: { original: c } }) => <span className={styles.mono}>{c.policy_count}</span> }),
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
    <div className={styles.page}>
      <PageHeader
        title="Customers & Policies"
        badge={masked ? <Pill tone="warning"><ShieldAlert aria-hidden className={styles.badgeIcon} />Masked view</Pill> : undefined}
        description="Customer 360: policies, renewals, calls and follow-ups for each policyholder. Opening a customer is recorded in the audit log."
      />
      <div className={styles.searchCard}>
        <Label htmlFor="cust-q" className={styles.searchLabel}>Search customers</Label>
        <div className={styles.searchBox}>
          <Search aria-hidden className={styles.searchIcon} />
          <Input id="cust-q" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} className={styles.searchInput}
            placeholder={masked ? "Name, customer code or policy no." : "Name, mobile, customer code or policy no."} />
        </div>
        {masked && <p className={styles.hint}>Your role sees masked mobile numbers and email, no date of birth, and can&apos;t search by mobile.</p>}
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
        empty={{ icon: Users, title: query ? "No customers match your search" : "No customers yet", description: query ? "Check the spelling or try a policy number." : IS_SANDBOX ? "Run make reset in the backend to load the sandbox data." : "Import customers with python -m app.import_customers in the backend." }}
      />
    </div>
  );
}
