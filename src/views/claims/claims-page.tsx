"use client";

import { FileSearch } from "lucide-react";
import { useCallback, useState } from "react";

import { useClaimColumns } from "@/components/claims/claim-columns";
import { type ClaimMove, MoveClaimDialog } from "@/components/claims/move-claim-dialog";
import { useClaims, usePatchClaim } from "@/components/claims/use-claims";
import { CLAIM_STATUS_LABEL, CLAIM_STATUSES } from "@/components/claims/utils";
import { PageHeader } from "@/components/common/page-header";
import { StatusTabs } from "@/components/follow-ups/status-tabs";
import { DataTable } from "@/components/ops/data-table";
import { useLevel } from "@/components/ops/use-level";
import type { Schemas } from "@/lib/api";

import styles from "./claims-page.module.scss";

export function ClaimsPage() {
  const canWrite = useLevel("claims") === "full";
  const [status, setStatus] = useState<Schemas["ClaimStatus"] | null>(null);
  const [move, setMove] = useState<ClaimMove | null>(null);

  const { data, isLoading, error, refetch } = useClaims(status);
  const { mutate, isPending } = usePatchClaim();
  const onMove = useCallback((claim: Schemas["ClaimRow"], to: Schemas["ClaimStatus"]) => setMove({ claim, to }), []);
  const columns = useClaimColumns({ canWrite, onMove, isPending });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Claims"
        description="Claims registered by customers, newest first. Move each one from review to approval or rejection, then settlement."
      />
      <StatusTabs tabs={[null, ...CLAIM_STATUSES]} labels={CLAIM_STATUS_LABEL} status={status} onChange={setStatus} />
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        numeric={["actions"]}
        empty={{
          icon: FileSearch,
          title: status ? `No ${CLAIM_STATUS_LABEL[status].toLowerCase()} claims` : "No claims yet",
          description: "Claims appear here once a customer registers one, on a call or with the team.",
        }}
      />
      <MoveClaimDialog move={move} onClose={() => setMove(null)}
        onConfirm={(m) => mutate({ id: m.claim.id, to: m.to })} />
    </div>
  );
}
