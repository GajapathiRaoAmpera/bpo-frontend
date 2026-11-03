"use client";

import { CalendarClock } from "lucide-react";
import { useCallback, useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { CancelFollowupDialog } from "@/components/follow-ups/cancel-followup-dialog";
import { useFollowupColumns } from "@/components/follow-ups/followup-columns";
import { StatusTabs } from "@/components/follow-ups/status-tabs";
import { PAGE_SIZE, useFollowups, usePatchFollowup } from "@/components/follow-ups/use-followups";
import { DataTable } from "@/components/ops/data-table";
import { FollowupDialog } from "@/components/ops/followup-dialog";
import { FOLLOWUP_STATUS_LABEL } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import type { Schemas } from "@/lib/api";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./follow-ups-page.module.scss";

export function FollowUpsPage() {
  const canWrite = useLevel("followups") === "full";
  const [status, setStatus] = useState<Schemas["FollowupStatus"] | null>("scheduled");
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<Schemas["FollowupRow"] | null>(null);

  const { data, isLoading, error, refetch } = useFollowups(status, page);
  const { mutate, isPending } = usePatchFollowup();
  const onDone = useCallback((id: number) => mutate({ id, to: "done" }), [mutate]);
  const columns = useFollowupColumns({ canWrite, onDone, onCancel: setCancelling, isPending });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Follow-ups"
        badge={<Pill tone="live" pulse>{IS_SANDBOX ? "Sandbox timer" : "Timer"} · every 2 min</Pill>}
        description={IS_SANDBOX ? "Payment links, callbacks and reminders. When one falls due, the sandbox timer writes a WhatsApp-style message (Gemini Flash, or a fixed template) and marks it sent. Nothing is sent to real numbers." : "Payment links, callbacks and reminders. When one falls due, the timer writes a WhatsApp-style message (Gemini Flash, or a fixed template) and marks it sent. WhatsApp is a pilot integration, so nothing reaches the customer yet."}
        actions={canWrite ? <FollowupDialog /> : undefined}
      />
      <StatusTabs tabs={["scheduled", "sent", "done", "cancelled", null]} labels={FOLLOWUP_STATUS_LABEL} status={status} onChange={(s) => { setStatus(s); setPage(1); }} />
      <DataTable
        columns={columns}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        numeric={["actions"]}
        page={page}
        pageSize={PAGE_SIZE}
        total={data?.total}
        onPage={setPage}
        empty={{
          icon: CalendarClock,
          title: status ? `No ${FOLLOWUP_STATUS_LABEL[status].toLowerCase()} follow-ups` : "No follow-ups yet",
          description: "Follow-ups are created by the AI during calls, or scheduled here by the team.",
          action: canWrite ? <FollowupDialog /> : undefined,
        }}
      />
      <CancelFollowupDialog followup={cancelling} onClose={() => setCancelling(null)}
        onConfirm={(id) => mutate({ id, to: "cancelled" })} />
    </div>
  );
}
