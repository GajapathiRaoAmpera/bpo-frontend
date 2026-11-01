"use client";

import { Bot, Headset, UserRound, X } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { useCallSession } from "@/components/live-monitor/use-live-monitor";
import { SPEAKER } from "@/components/live-monitor/utils";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/labels";

import styles from "./call-panel.module.scss";

export function CallPanel({ callId, onClose }: { callId: number; onClose: () => void }) {
  const { data, error } = useCallSession(callId);
  const turns = data?.turns.filter((t) => t.speaker !== "tool").slice(-12) ?? [];
  return (
    <aside aria-label="Call detail" className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>{data?.call_ref ?? "Loading call…"}</h2>
        <Button size="icon-sm" variant="ghost" onClick={onClose} aria-label="Close call detail"><X aria-hidden /></Button>
      </div>
      {error && <p role="alert" className={styles.panelError}>{error.message}</p>}
      {data && (
        <>
          <div className={styles.panelPills}>
            {data.ended_at ? <Pill tone="neutral">Call ended</Pill> : data.taken_over ? <Pill tone="warning">Taken over by agent</Pill> : <Pill tone="live" pulse>AI handling</Pill>}
            {data.customer && <Pill tone="info"><UserRound aria-hidden className={styles.pillIcon} /> {data.customer.full_name}</Pill>}
          </div>
          <p className={styles.panelNote}>
            Takeover is done by the agent who started the call, from their Agent Console. This view follows the transcript live.
          </p>
          <ol className={styles.transcript}>
            {turns.length === 0 && <li className={styles.panelNote}>No transcript yet.</li>}
            {turns.map((t) => (
              <li key={t.seq} className={styles.turn}>
                <span className={styles.turnSpeaker}>
                  {t.speaker === "bot" ? <Bot aria-hidden className={styles.pillIcon} /> : t.speaker === "agent" ? <Headset aria-hidden className={styles.pillIcon} /> : <UserRound aria-hidden className={styles.pillIcon} />}
                  {SPEAKER[t.speaker]} · <span className={styles.turnOffset}>{formatDuration(t.offset_ms / 1000)}</span>
                </span>
                <p className={styles.turnText}>{t.text}</p>
              </li>
            ))}
          </ol>
        </>
      )}
    </aside>
  );
}
