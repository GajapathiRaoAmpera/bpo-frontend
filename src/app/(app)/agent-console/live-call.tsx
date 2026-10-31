"use client";

import { Bot, Headset, Loader2, Mic, MicOff, PhoneOff, Siren, UserRound, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { VoicePhase } from "@/hooks/use-voice-call";
import type { Schemas } from "@/lib/api";
import { formatDuration, OUTCOME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./live-call.module.scss";

type Session = Schemas["SessionOut"];
type Turn = Schemas["TurnOut"];

const WRAP_UP: Schemas["CallOutcome"][] = ["payment_link_sent", "callback_scheduled", "info_provided", "not_interested", "escalated"];

function useElapsed(startedAt: string | undefined, running: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);
  return startedAt ? Math.max(0, (now - new Date(startedAt).getTime()) / 1000) : 0;
}

function TurnRow({ turn, agentName }: { turn: Turn; agentName: string }) {
  if (turn.speaker === "tool") {
    return (
      <li className={styles.toolTurn}>
        <Wrench aria-hidden className={styles.toolIcon} />
        <span className={styles.toolTime}>{formatDuration(turn.offset_ms / 1000)}</span>
        {turn.text}
      </li>
    );
  }
  const who = {
    bot: { label: "Vani (AssureVoice AI)", icon: Bot, chip: styles.botChip, row: styles.botRow, name: styles.botName },
    customer: { label: "Customer", icon: UserRound, chip: styles.customerChip, row: styles.customerRow, name: styles.customerName },
    agent: { label: agentName, icon: Headset, chip: styles.agentChip, row: styles.agentRow, name: styles.agentName },
  }[turn.speaker];
  return (
    <li className={cn(styles.turn, who.row)}>
      <div className={styles.turnHead}>
        <span className={cn(styles.chip, who.chip)}>
          <who.icon aria-hidden className={styles.chipIcon} />
        </span>
        <span className={styles.turnTime}>{formatDuration(turn.offset_ms / 1000)}</span>
        <span className={cn(styles.speaker, who.name)}>{who.label}</span>
      </div>
      <p className={styles.turnText}>{turn.text}</p>
    </li>
  );
}

export function LiveCall({ session, phase, voice, agentName, onTakeover, onEnd, busy }: {
  session: Session;
  phase: VoicePhase;
  voice: { micOn: boolean; micLevel: number; botCaption: string; userCaption: string; botSpeaking: boolean; error: string | null; toggleMic: () => void };
  agentName: string;
  onTakeover: () => void;
  onEnd: (outcome?: Schemas["CallOutcome"], note?: string) => void;
  busy: boolean;
}) {
  const ended = Boolean(session.ended_at);
  const humanOnCall = session.taken_over && !ended;
  const aiOnCall = !ended && !session.taken_over && phase === "live";
  const elapsed = useElapsed(session.started_at, !ended);
  const escalationRequested = !ended && !session.taken_over && session.turns.some(
    (t) => t.tool_name === "escalate_to_human" && (t.tool_payload?.result as { ok?: boolean } | undefined)?.ok);
  const [outcome, setOutcome] = useState<Schemas["CallOutcome"]>("payment_link_sent");
  const [note, setNote] = useState("");
  const listRef = useRef<HTMLOListElement>(null);
  const shown = session.turns.length + (voice.botCaption ? 1 : 0) + (voice.userCaption ? 1 : 0);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [shown]);

  const status = ended
    ? <Pill tone="neutral">Call ended</Pill>
    : humanOnCall ? <Pill tone="info">You are on the call</Pill>
      : phase === "connecting" ? <Pill tone="warning" pulse>Connecting</Pill>
        : phase === "live" ? <Pill tone="live" pulse>AI on call</Pill>
          : phase === "error" ? <Pill tone="danger">Connection failed</Pill>
            : <Pill tone="neutral">Disconnected</Pill>;

  return (
    <section aria-labelledby="live-heading" className={styles.call}>
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
                  style={{ height: `${Math.max(3, Math.min(20, voice.micLevel * 60 * f))}px` }} />
              ))}
            </span>
            <Button variant="secondary" size="sm" onClick={voice.toggleMic} aria-pressed={!voice.micOn}>
              {voice.micOn ? <Mic aria-hidden /> : <MicOff aria-hidden />}
              {voice.micOn ? "Mute mic" : "Unmute mic"}
            </Button>
          </div>
        )}
      </header>

      {voice.error && !ended && (
        <div role="alert" className={cn(styles.dangerBox, styles.voiceError)}>
          {voice.error}
        </div>
      )}
      {escalationRequested && (
        <div role="alert" className={cn(styles.dangerBox, styles.escalation)}>
          <span className={styles.escalationText}>
            <Siren aria-hidden className={styles.siren} /> The AI asked for a human agent on this call.
          </span>
          <Button size="sm" onClick={onTakeover} disabled={busy}><Headset aria-hidden />Take over now</Button>
        </div>
      )}
      {aiOnCall && (
        <p className={styles.sandboxHint}>
          {IS_SANDBOX ? "Sandbox: speak" : "Speak"} as the customer into your microphone. The AI cannot see your screen.
        </p>
      )}

      <ol ref={listRef} aria-live="polite" className={styles.transcript}>
        {session.turns.length === 0 && !voice.botCaption && (
          <li className={styles.placeholder}>
            {phase === "connecting" ? <Loader2 aria-hidden className={styles.spinnerIcon} /> : <Bot aria-hidden className={styles.placeholderIcon} />}
            {phase === "connecting" ? "Connecting to the voice agent…" : "The transcript will appear here as the call happens."}
          </li>
        )}
        {session.turns.map((t) => <TurnRow key={t.seq} turn={t} agentName={agentName} />)}
        {voice.userCaption && (
          <li className={cn(styles.caption, styles.userCaption)}>{voice.userCaption}…</li>
        )}
        {voice.botCaption && (
          <li className={cn(styles.caption, styles.botCaption)}>
            <span className={styles.captionLabel}>{voice.botSpeaking ? "Speaking" : "Preparing"}</span>
            {voice.botCaption}
          </li>
        )}
      </ol>

      {!ended && (
        <footer className={styles.footer}>
          {humanOnCall ? (
            <form
              className={styles.wrapUp}
              onSubmit={(e) => {
                e.preventDefault();
                onEnd(outcome, note || undefined);
              }}
            >
              <fieldset className={styles.outcomes}>
                <legend className={styles.legend}>How did the call end?</legend>
                <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as Schemas["CallOutcome"])} className={styles.outcomeGrid}>
                  {WRAP_UP.map((o) => (
                    <Label key={o} htmlFor={`o-${o}`} className={styles.outcome}>
                      <RadioGroupItem id={`o-${o}`} value={o} />
                      {OUTCOME_LABEL[o]}
                    </Label>
                  ))}
                </RadioGroup>
                {(outcome === "payment_link_sent" || outcome === "callback_scheduled") && !session.verified && (
                  <p className={styles.warning}>The customer isn&apos;t verified, so no link or callback will be created; your note is saved.</p>
                )}
              </fieldset>
              <div className={styles.noteField}>
                <Label htmlFor="wrap-note" className={styles.noteLabel}>Note for the record</Label>
                <Textarea id="wrap-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2}
                  placeholder="e.g. Customer will pay tonight after salary credit." />
              </div>
              <Button type="submit" disabled={busy} className={styles.submit}>
                {busy ? <Loader2 aria-hidden className={styles.spinner} /> : <PhoneOff aria-hidden />} End call
              </Button>
            </form>
          ) : (
            <div className={styles.actions}>
              <Button variant="outline" onClick={onTakeover} disabled={busy || phase !== "live"}>
                <Headset aria-hidden /> Take over call
              </Button>
              <Button variant="destructive" onClick={() => onEnd()} disabled={busy}>
                {busy ? <Loader2 aria-hidden className={styles.spinner} /> : <PhoneOff aria-hidden />} End call
              </Button>
            </div>
          )}
        </footer>
      )}
    </section>
  );
}
