"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { Bot, CalendarClock, Check, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { DataTable, type Features } from "@/components/ops/data-table";
import { FollowupDialog } from "@/components/ops/followup-dialog";
import { FOLLOWUP_KIND_LABEL, FOLLOWUP_STATUS_LABEL, FOLLOWUP_TONE } from "@/components/ops/tones";
import { useLevel } from "@/components/ops/use-level";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type Row = Schemas["FollowupRow"];
type Status = Schemas["FollowupStatus"];
const h = createColumnHelper<Features, Row>();
const TABS: (Status | null)[] = ["scheduled", "sent", "done", "cancelled", null];
const PAGE_SIZE = 25;

export function Followups() {
  const queryClient = useQueryClient();
  const canWrite = useLevel("followups") === "full";
  const [status, setStatus] = useState<Status | null>("scheduled");
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<Row | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["followups", { status, page }],
    queryFn: () => unwrap(api.GET("/api/v1/followups", { params: { query: { status, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000, // picks up messages the 2-minute sandbox timer sends
  });

  const patch = useMutation({
    mutationFn: ({ id, to }: { id: number; to: "done" | "cancelled" }) =>
      unwrap(api.PATCH("/api/v1/followups/{followup_id}", { params: { path: { followup_id: id } }, body: { status: to } })),
    onSuccess: async (f) => {
      await queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast.success(`${FOLLOWUP_KIND_LABEL[f.kind]} for ${f.customer_name} marked ${f.status}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const { mutate, isPending } = patch;
  const columns = useMemo(() => h.columns([
    h.display({ id: "customer", header: "Customer", cell: ({ row: { original: f } }) => (
      <div className="flex flex-col">
        <Link href={`/customers/${f.customer_id}`} className="text-label-md text-on-surface hover:text-primary hover:underline">{f.customer_name}</Link>
        <span className="text-data-mono text-label-xs text-on-surface-variant">{f.policy_no}</span>
      </div>
    ) }),
    h.display({ id: "kind", header: "Type", cell: ({ row: { original: f } }) => FOLLOWUP_KIND_LABEL[f.kind] }),
    h.display({ id: "due", header: "Due", cell: ({ row: { original: f } }) => <span className="whitespace-nowrap">{formatDateTime(f.due_at)}</span> }),
    h.display({ id: "status", header: "Status", cell: ({ row: { original: f } }) => <Pill tone={FOLLOWUP_TONE[f.status]}>{FOLLOWUP_STATUS_LABEL[f.status]}</Pill> }),
    h.display({ id: "message", header: "WhatsApp message", cell: ({ row: { original: f } }) => (f.message_text
      ? <span className="flex max-w-md items-start gap-1.5"><MessageCircle aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" /><span className="line-clamp-2" title={f.message_text}>{f.message_text}</span></span>
      : <span className="text-on-surface-variant">{f.reason}</span>) }),
    h.display({ id: "by", header: "Created by", cell: ({ row: { original: f } }) => (f.created_by_name ?? <span className="flex items-center gap-1"><Bot aria-hidden className="size-3.5 text-secondary" />AI agent</span>) }),
    ...(canWrite ? [h.display({ id: "actions", header: "Actions", cell: ({ row: { original: f } }) => (
      f.status === "scheduled" || f.status === "sent" ? (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => mutate({ id: f.id, to: "done" })}><Check aria-hidden />Mark done</Button>
          {f.status === "scheduled" && <Button size="sm" variant="ghost" onClick={() => setCancelling(f)}><X aria-hidden />Cancel</Button>}
        </div>
      ) : null) })] : []),
  ]), [canWrite, mutate, isPending]);

  return (
    <div className="flex flex-col gap-space-xl">
      <PageHeader
        title="Follow-ups"
        badge={<Pill tone="live" pulse>Sandbox timer · every 2 min</Pill>}
        description="Payment links, callbacks and reminders. When one falls due, the sandbox timer writes a WhatsApp-style message (Gemini Flash, or a fixed template) and marks it sent. Nothing is sent to real numbers."
        actions={canWrite ? <FollowupDialog /> : undefined}
      />
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-1 rounded-lg bg-surface-container-lowest p-space-sm text-label-xs shadow-card">
        {TABS.map((s) => (
          <button key={s ?? "all"} type="button" aria-pressed={status === s} onClick={() => { setStatus(s); setPage(1); }}
            className={cn("rounded-lg px-2.5 py-1.5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-lang-border",
              status === s ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high")}>
            {s ? FOLLOWUP_STATUS_LABEL[s] : "All"}
          </button>
        ))}
      </div>
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
      <AlertDialog open={cancelling !== null} onOpenChange={(o) => { if (!o) setCancelling(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {cancelling && FOLLOWUP_KIND_LABEL[cancelling.kind].toLowerCase()} for {cancelling?.customer_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The {cancelling && formatDateTime(cancelling.due_at)} follow-up on {cancelling?.policy_no} won&apos;t be sent. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep follow-up</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => cancelling && patch.mutate({ id: cancelling.id, to: "cancelled" })}>Cancel follow-up</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
