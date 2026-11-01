"use client";

import { Activity } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { CallCard } from "@/components/live-monitor/call-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { SCREEN_HREF } from "@/lib/routes";
import { cn } from "@/lib/utils";

import styles from "./call-list.module.scss";

export function CallList({ data, isLoading, error, onRetry, now, openId, onOpen, canConsole }: {
  data: Schemas["LiveCallRow"][] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  now: number;
  openId: number | null;
  onOpen?: (callId: number) => void;
  canConsole?: boolean;
}) {
  const calls = data ?? [];
  return (
    <section aria-label="Calls in progress" className={cn(styles.calls, !!openId && styles.callsWithPanel)}>
      {isLoading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className={styles.callSkeleton} />)}
      {error && <ErrorAlert layout="stacked" onRetry={onRetry}>{error.message}</ErrorAlert>}
      {data?.length === 0 && (
        <EmptyState icon={Activity} title="No calls in progress"
          description="Calls appear here as soon as an agent starts one from the Agent Console. This page refreshes every 5 seconds."
          action={canConsole ? <Button asChild><Link href={SCREEN_HREF.agent_console}>Open Agent Console</Link></Button> : undefined} />
      )}
      {calls.length > 0 && (
        <ul className={styles.callList}>
          {calls.map((c) => (
            <CallCard key={c.call_id} call={c} now={now} selected={c.call_id === openId}
              onOpen={onOpen ? () => onOpen(c.call_id) : undefined} />
          ))}
        </ul>
      )}
    </section>
  );
}
