"use client";

import { Eye, Headset, ShieldCheck } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { SPEAKER } from "@/components/live-monitor/utils";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { formatDuration, SENTIMENT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./call-card.module.scss";

type LiveCall = Schemas["LiveCallRow"];

const SENTIMENT_TONE = { positive: "success", neutral: "neutral", negative: "danger" } as const;

function status(call: LiveCall) {
  if (call.taken_over) return <Pill tone="warning"><Headset aria-hidden className={styles.pillIcon} /> Human on call</Pill>;
  if (call.bot_connected) return <Pill tone="live" pulse>AI on call</Pill>;
  return <Pill tone="neutral">Connecting</Pill>;
}

export function CallCard({ call, now, selected, onOpen }: { call: LiveCall; now: number; selected: boolean; onOpen?: () => void }) {
  const elapsed = now ? Math.max(0, (now - new Date(call.started_at).getTime()) / 1000) : 0;
  return (
    <li className={cn(styles.callCard, selected && styles.callCardSelected)}>
      <div className={styles.callHead}>
        <span className={cn(styles.dot, call.taken_over && styles.dotHuman)} aria-hidden />
        <span className={styles.callName}>{call.customer_name ?? "Unidentified caller"}</span>
        {call.customer_phone && <span className={styles.phone}>{call.customer_phone}</span>}
        <span className={styles.callStatus}>
          {status(call)}
          <Pill tone="info">In call · {formatDuration(Math.max(0, elapsed))}</Pill>
        </span>
      </div>
      <dl className={styles.facts}>
        <div className={styles.fact}>
          <dt className={styles.label}>Call</dt>
          <dd className={styles.callRef}>{call.call_ref}</dd>
          <dd className={styles.muted}>{call.mode === "renewal" ? "Renewal" : "Inbound"}{call.policy_no ? ` · ${call.policy_no}` : ""}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.label}>Agent desk</dt>
          <dd className={styles.strong}>{call.agent_name ?? "AI only"}</dd>
          <dd className={styles.muted}>Started {formatTime(call.started_at)}</dd>
        </div>
        <div className={styles.fact}>
          <dt className={styles.label}>Verification · sentiment</dt>
          <dd>{call.verified ? <Pill tone="success"><ShieldCheck aria-hidden className={styles.pillIcon} /> Verified</Pill> : <Pill tone="neutral">Not verified yet</Pill>}</dd>
          <dd>{call.sentiment
            ? <Pill tone={SENTIMENT_TONE[call.sentiment]}>{SENTIMENT_LABEL[call.sentiment]}</Pill>
            : <span className={styles.muted}>Sentiment scored after the call</span>}</dd>
        </div>
      </dl>
      <div className={styles.callFoot}>
        <p className={styles.lastLine}>
          {call.last_text
            ? <><span className={styles.lastSpeaker}>{SPEAKER[call.last_speaker ?? "bot"]}:</span> {call.last_text}</>
            : "Waiting for the first words on the call."}
        </p>
        {onOpen && (
          <Button size="sm" variant="outline" onClick={onOpen} aria-pressed={selected}>
            <Eye aria-hidden /> Open call
          </Button>
        )}
      </div>
    </li>
  );
}
