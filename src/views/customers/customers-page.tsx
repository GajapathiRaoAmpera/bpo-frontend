"use client";

import { ShieldAlert } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { CustomerSearch } from "@/components/customers/customer-search";
import { CustomersTable } from "@/components/customers/customers-table";
import { useCustomers } from "@/components/customers/use-customers";
import { useLevel } from "@/components/ops/use-level";

import styles from "./customers-page.module.scss";

export function CustomersPage() {
  const masked = useLevel("customers") === "masked";
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const query = useDeferredValue(q.trim());
  const { data, isLoading, error, refetch } = useCustomers({ query, page });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Customers & Policies"
        badge={masked ? <Pill tone="warning"><ShieldAlert aria-hidden className={styles.badgeIcon} />Masked view</Pill> : undefined}
        description="Customer 360: policies, renewals, calls and follow-ups for each policyholder. Opening a customer is recorded in the audit log."
      />
      <CustomerSearch q={q} onQ={(v) => { setQ(v); setPage(1); }} masked={masked} />
      <CustomersTable data={data} isLoading={isLoading} error={error} onRetry={() => refetch()}
        page={page} onPage={setPage} query={query} />
    </div>
  );
}
