"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import type { VoicePhase } from "@/hooks/use-voice-call";
import type { Schemas } from "@/lib/api";
import { formatDuration } from "@/lib/labels";

import styles from "./live-call-header.module.scss";

function useElapsed(startedAt: string | undefined, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  return startedAt ? Math.max(0, (now - new Date(startedAt).getTime()) / 1000) : 0;
}

export function LiveCallHeader({ session, phase, aiOnCall, micOn, micLevel, toggleMic }: {
  session: Schemas["SessionOut"];
  phase: VoicePhase;
  aiOnCall: boolean;
  micOn: boolean;
  micLevel: number;
  toggleMic: () => void;
}) {
  const ended = Boolean(session.ended_at);
  const humanOnCall = session.taken_over && !ended;
  const elapsed = useElapsed(session.started_at, !ended);

  const status = ended
    ? <Pill tone="neutral">Call ended</Pill>
    : humanOnCall ? <Pill tone="info">You are on the call</Pill>
      : phase === "connecting" ? <Pill tone="warning" pulse>Connecting</Pill>
        : phase === "live" ? <Pill tone="live" pulse>AI on call</Pill>
          : phase === "error" ? <Pill tone="danger">Connection failed</Pill>
            : <Pill tone="neutral">Disconnected</Pill>;

  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <div className={styles.titleRow}>
          <h2 id="live-heading" className={styles.title}>
            {session.mode === "renewal" ? "Renewal call" : "Inbound call"}
          </h2>
          {status}
        </div>
        <span className={styles.callMeta}>
          <span className={styles.mono}>{session.call_ref}</span> · {formatDuration(ended ? session.duration_sec : elapsed)}
        </span>
      </div>
      {aiOnCall && (
        <div className={styles.micControls}>
          <span aria-hidden className={styles.meter}>
            {[0.35, 0.6, 1, 0.6, 0.35].map((f, i) => (
              <span key={i} className={styles.meterBar}
                style={{ height: `${Math.max(3, Math.min(20, micLevel * 60 * f))}px` }} />
            ))}
          </span>
          <Button variant="secondary" size="sm" onClick={toggleMic} aria-pressed={!micOn}>
            {micOn ? <Mic aria-hidden /> : <MicOff aria-hidden />}
            {micOn ? "Mute mic" : "Unmute mic"}
          </Button>
        </div>
      )}
    </header>
  );
}
