"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

import { Pill } from "@/components/common/pill";
import { PAGE_SIZE } from "@/components/customers/use-customers";
import { DataTable, type Features } from "@/components/ops/data-table";
import type { Schemas } from "@/lib/api";
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

export function CustomersTable({ data, isLoading, error, onRetry, page, onPage, query }: {
  data: Schemas["CustomerPage"] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  page: number;
  onPage: (page: number) => void;
  query: string;
}) {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      data={data?.items}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      numeric={["policies"]}
      onRowClick={(c) => router.push(`/customers/${c.id}`)}
      rowLabel={(c) => `Open ${c.full_name}`}
      page={page}
      pageSize={PAGE_SIZE}
      total={data?.total}
      onPage={onPage}
      empty={{ icon: Users, title: query ? "No customers match your search" : "No customers yet", description: query ? "Check the spelling or try a policy number." : IS_SANDBOX ? "Run make reset in the backend to load the sandbox data." : "Import customers with python -m app.import_customers in the backend." }}
    />
  );
}
