"use client";

import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { CustomerCallsCard } from "@/components/customers/customer-calls-card";
import { CustomerFollowupsCard } from "@/components/customers/customer-followups-card";
import { CustomerHero } from "@/components/customers/customer-hero";
import { CustomerPoliciesCard } from "@/components/customers/customer-policies-card";
import { useCustomer } from "@/components/customers/use-customers";
import { useLevel } from "@/components/ops/use-level";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api";

import styles from "./customer-detail-page.module.scss";

type Params = Promise<{ id: string }>;

export function CustomerDetailPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<Skeleton className={styles.fallback} />}>
      <CustomerDetail params={params} />
    </Suspense>
  );
}

function CustomerDetail({ params }: { params: Params }) {
  const { id } = use(params);
  const customerId = Number(id);
  const canFollowUp = useLevel("followups") === "full";
  const callsLevel = useLevel("calls");
  const { data: c, isLoading, error, refetch } = useCustomer(customerId);

  const back = <Button asChild variant="outline"><Link href="/customers"><ArrowLeft aria-hidden />Back to customers</Link></Button>;
  if (!Number.isInteger(customerId) || (error instanceof ApiError && error.status === 404)) {
    return <EmptyState icon={UserX} title="Customer not found" description="This customer record doesn't exist." action={back} />;
  }
  if (error) return <ErrorAlert onRetry={() => refetch()}>{error.message}</ErrorAlert>;
  if (isLoading || !c) {
    return (
      <div className={styles.page} aria-busy="true">
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonBody} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <CustomerHero c={c} back={back} />
      <CustomerPoliciesCard policies={c.policies} canFollowUp={canFollowUp} />
      <div className={styles.columns}>
        <div className={styles.callsCol}>
          <CustomerCallsCard calls={c.calls} callsLevel={callsLevel} />
        </div>
        <div className={styles.followupsCol}>
          <CustomerFollowupsCard followups={c.followups} />
        </div>
      </div>
    </div>
  );
}
