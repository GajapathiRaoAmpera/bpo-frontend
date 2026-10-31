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

import styles from "./renewal-queue.module.scss";

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
    <section aria-labelledby="queue-heading" className={styles.queue}>
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 id="queue-heading" className={styles.heading}>Renewal queue</h2>
          {data && <Pill tone="info">{data.length} due</Pill>}
        </div>
        <p className={styles.hint}>Policies renewing soonest. Pick one to place an AI renewal call.</p>
      </div>

      <div className={styles.list}>
        {isLoading && Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className={styles.skeleton} />)}
        {error && (
          <div role="alert" className={styles.error}>
            {error.message}
            <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
          </div>
        )}
        {data?.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <Inbox aria-hidden />
            </span>
            <p className={styles.emptyTitle}>No renewals due in the next 30 days</p>
            <p className={styles.hint}>You can still take an inbound call below.</p>
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
              className={cn(styles.item, selected && styles.itemSelected)}
            >
              {selected && <span aria-hidden className={styles.selectedBar} />}
              <div className={styles.itemHead}>
                <span className={styles.customer}>{item.customer_name}</span>
                <span className={styles.premium}>{formatINR(item.premium_inr)}</span>
              </div>
              <div className={styles.itemMeta}>
                <span className={styles.policyNo}>{item.policy_no}</span>
                <span className={styles.product}>{PRODUCT_LABEL[item.product]} · {item.city}</span>
              </div>
              <div className={styles.itemFoot}>
                <span className={styles.due}>
                  <CalendarClock aria-hidden className={styles.dueIcon} /> Due {formatDate(item.renewal_date)}
                </span>
                <Pill tone="lang">{LANGUAGE_LABEL[item.preferred_language]}</Pill>
              </div>
              {item.last_called_at && (
                <span className={styles.lastCalled}>Last called {formatDateTime(item.last_called_at)}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.panel}>
        <Button onClick={() => onStart("renewal", selectedId ?? undefined)} disabled={!selectedId || busy || disabled} size="lg">
          {busy ? <Loader2 aria-hidden className={styles.spinner} /> : <PhoneOutgoing aria-hidden />}
          Start renewal call
        </Button>
        <Button variant="outline" onClick={() => onStart("inbound")} disabled={busy || disabled} size="lg">
          <PhoneIncoming aria-hidden /> Take inbound call
        </Button>
      </div>
    </section>
  );
}
