"use client";

import { useState } from "react";

import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { CallList } from "@/components/live-monitor/call-list";
import { CallPanel } from "@/components/live-monitor/call-panel";
import { LiveKpis } from "@/components/live-monitor/live-kpis";
import { useLiveCalls, useNow } from "@/components/live-monitor/use-live-monitor";
import { useMe } from "@/hooks/use-me";

import styles from "./live-monitor-page.module.scss";

export function LiveMonitorPage() {
  const { data: me } = useMe();
  const canOpen = me?.nav.find((n) => n.screen === "live_monitor")?.level === "full";
  const canConsole = me?.nav.some((n) => n.screen === "agent_console");
  const [openId, setOpenId] = useState<number | null>(null);
  const now = useNow();
  const { data, isLoading, error, refetch } = useLiveCalls();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Live Monitor"
        badge={<Pill tone="live" pulse>Live · every 5 s</Pill>}
        description={canOpen
          ? "Every call in progress on the floor. Open a call to follow its transcript and takeover status."
          : "Every call in progress on the floor. View only for your role."}
      />

      <LiveKpis calls={data ?? []} />

      <div className={styles.layout}>
        <CallList data={data} isLoading={isLoading} error={error} onRetry={() => refetch()} now={now} openId={openId}
          onOpen={canOpen ? setOpenId : undefined} canConsole={canConsole} />
        {openId && canOpen && (
          <div className={styles.panelSlot}><CallPanel callId={openId} onClose={() => setOpenId(null)} /></div>
        )}
      </div>
    </div>
  );
}
