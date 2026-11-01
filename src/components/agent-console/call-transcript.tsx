"use client";

import { Bot, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { TurnRow } from "@/components/agent-console/turn-row";
import type { VoicePhase } from "@/hooks/use-voice-call";
import type { Schemas } from "@/lib/api";
import { cn } from "@/lib/utils";

import styles from "./call-transcript.module.scss";

export function CallTranscript({ turns, phase, botCaption, userCaption, botSpeaking, agentName }: {
  turns: Schemas["TurnOut"][];
  phase: VoicePhase;
  botCaption: string;
  userCaption: string;
  botSpeaking: boolean;
  agentName: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);
  const shown = turns.length + (botCaption ? 1 : 0) + (userCaption ? 1 : 0);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [shown]);

  return (
    <ol ref={listRef} aria-live="polite" className={styles.transcript}>
      {turns.length === 0 && !botCaption && (
        <li className={styles.placeholder}>
          {phase === "connecting" ? <Loader2 aria-hidden className={styles.spinnerIcon} /> : <Bot aria-hidden className={styles.placeholderIcon} />}
          {phase === "connecting" ? "Connecting to the voice agent…" : "The transcript will appear here as the call happens."}
        </li>
      )}
      {turns.map((t) => <TurnRow key={t.seq} turn={t} agentName={agentName} />)}
      {userCaption && (
        <li className={cn(styles.caption, styles.userCaption)}>{userCaption}…</li>
      )}
      {botCaption && (
        <li className={cn(styles.caption, styles.botCaption)}>
          <span className={styles.captionLabel}>{botSpeaking ? "Speaking" : "Preparing"}</span>
          {botCaption}
        </li>
      )}
    </ol>
  );
}
