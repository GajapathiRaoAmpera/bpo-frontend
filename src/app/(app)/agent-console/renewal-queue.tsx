"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Inbox, Loader2, PhoneIncoming, PhoneOutgoing } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDate, formatDateTime, formatINR } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

export function RenewalQueue({ selectedId, onSelect, onStart, busy, disabled }: {
  selectedId: number | null;
  onSelect: (item: Schemas["QueueItem"]) => void;
  onStart: (mode: Schemas["CallMode"], policyId?: number) => void;
  busy: boolean;
  disabled: boolean;
}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["voice", "queue"],
    queryFn: () => unwrap(api.GET("/api/v1/voice/queue")),
  });

  return (
    <section aria-labelledby="queue-heading" className="flex flex-col gap-space-md">
      <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-card">
        <div className="flex items-center justify-between">
          <h2 id="queue-heading" className="text-headline-sm text-on-surface">Renewal queue</h2>
          {data && <Pill tone="info">{data.length} due</Pill>}
        </div>
        <p className="text-body-sm text-on-surface-variant">Policies renewing soonest. Pick one to place an AI renewal call.</p>
      </div>

      <div className="flex max-h-[calc(100vh-24rem)] min-h-64 flex-col gap-space-sm overflow-y-auto pr-1">
        {isLoading && Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[104px] rounded-lg bg-surface-container-lowest" />)}
        {error && (
          <div role="alert" className="flex flex-col items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
            {error.message}
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        )}
        {data?.length === 0 && (
          <div className="flex flex-col items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-xl text-center shadow-card">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-primary-container">
              <Inbox aria-hidden className="size-5" />
            </span>
            <p className="text-label-md text-on-surface">No renewals due in the next 30 days</p>
            <p className="text-body-sm text-on-surface-variant">You can still take an inbound call below.</p>
          </div>
        )}
        {data?.map((item) => {
          const selected = item.policy_id === selectedId;
          return (
            <button
              key={item.policy_id}
              type="button"
              onClick={() => onSelect(item)}
              aria-pressed={selected}
              disabled={disabled}
              className={cn(
                "relative flex shrink-0 flex-col gap-space-xs overflow-hidden rounded-lg bg-surface-container-lowest p-space-md text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border disabled:cursor-not-allowed disabled:opacity-60",
                selected ? "border-2 border-primary shadow-popover" : "border border-divider shadow-card hover:border-neutral-border",
              )}
            >
              {selected && <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-primary" />}
              <div className="flex items-start justify-between gap-space-sm">
                <span className="text-label-md text-on-surface">{item.customer_name}</span>
                <span className="text-data-mono text-on-surface">{formatINR(item.premium_inr)}</span>
              </div>
              <div className="flex items-center gap-space-sm text-label-xs">
                <span className="shrink-0 rounded-full bg-surface-container-high px-2 py-0.5 text-data-mono text-[11px] whitespace-nowrap text-primary">{item.policy_no}</span>
                <span className="truncate text-on-surface-variant">{PRODUCT_LABEL[item.product]} · {item.city}</span>
              </div>
              <div className="flex items-center justify-between gap-space-sm border-t border-outline-variant/30 pt-space-xs text-label-xs">
                <span className="flex items-center gap-1 font-medium text-on-surface-variant">
                  <CalendarClock aria-hidden className="size-3.5 text-primary" /> Due {formatDate(item.renewal_date)}
                </span>
                <Pill tone="lang">{LANGUAGE_LABEL[item.preferred_language]}</Pill>
              </div>
              {item.last_called_at && (
                <span className="text-label-xs font-medium text-outline">Last called {formatDateTime(item.last_called_at)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-card">
        <Button onClick={() => onStart("renewal", selectedId ?? undefined)} disabled={!selectedId || busy || disabled} size="lg">
          {busy ? <Loader2 aria-hidden className="animate-spin" /> : <PhoneOutgoing aria-hidden />}
          Start renewal call
        </Button>
        <Button variant="outline" onClick={() => onStart("inbound")} disabled={busy || disabled} size="lg">
          <PhoneIncoming aria-hidden /> Take inbound call
        </Button>
      </div>
    </section>
  );
}
