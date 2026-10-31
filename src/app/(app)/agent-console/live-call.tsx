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
      <li className="flex items-center gap-space-sm px-space-md text-label-sm font-medium text-on-surface-variant">
        <Wrench aria-hidden className="size-3.5 text-secondary" />
        <span className="text-data-mono text-label-xs text-outline">{formatDuration(turn.offset_ms / 1000)}</span>
        {turn.text}
      </li>
    );
  }
  const who = {
    bot: { label: "Vani (AssureVoice AI)", icon: Bot, chip: "bg-secondary-container/60 text-on-secondary-container", row: "bg-surface-container-low/40", name: "text-secondary" },
    customer: { label: "Customer", icon: UserRound, chip: "bg-surface-container-high text-primary", row: "bg-surface-container-lowest border border-divider", name: "text-on-surface" },
    agent: { label: agentName, icon: Headset, chip: "bg-primary-container text-on-primary", row: "bg-primary-fixed/40", name: "text-primary" },
  }[turn.speaker];
  return (
    <li className={cn("flex flex-col gap-1.5 rounded-lg p-space-md", who.row)}>
      <div className="flex items-center gap-space-sm">
        <span className={cn("rounded px-2 py-0.5 text-label-xs", who.chip)}>
          <who.icon aria-hidden className="inline size-3" />
        </span>
        <span className="text-data-mono text-label-xs text-on-surface-variant">{formatDuration(turn.offset_ms / 1000)}</span>
        <span className={cn("text-label-sm font-semibold", who.name)}>{who.label}</span>
      </div>
      <p className="pl-1 text-body-md leading-normal text-on-surface">{turn.text}</p>
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
    <section aria-labelledby="live-heading" className="flex min-h-[calc(100vh-11rem)] flex-col rounded-lg bg-surface-container-lowest shadow-card">
      <header className="flex flex-wrap items-center justify-between gap-space-md border-b border-divider p-space-md">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-space-sm">
            <h2 id="live-heading" className="text-headline-md text-on-surface">
              {session.mode === "renewal" ? "Renewal call" : "Inbound call"}
            </h2>
            {status}
          </div>
          <span className="text-label-xs font-medium text-on-surface-variant">
            <span className="text-data-mono">{session.call_ref}</span> · {formatDuration(ended ? session.duration_sec : elapsed)}
          </span>
        </div>
        {aiOnCall && (
          <div className="flex items-center gap-space-sm">
            <span aria-hidden className="flex h-5 items-end gap-0.5">
              {[0.35, 0.6, 1, 0.6, 0.35].map((f, i) => (
                <span key={i} className="w-1 rounded-full bg-primary-container transition-[height] duration-100"
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
        <div role="alert" className="mx-space-md mt-space-md rounded-lg border border-danger-border bg-danger-bg p-space-sm text-body-sm text-danger-text">
          {voice.error}
        </div>
      )}
      {escalationRequested && (
        <div role="alert" className="mx-space-md mt-space-md flex items-center justify-between gap-space-md rounded-lg border border-danger-border bg-danger-bg p-space-md">
          <span className="flex items-center gap-space-sm text-label-md text-danger-text">
            <Siren aria-hidden className="size-4 animate-pulse" /> The AI asked for a human agent on this call.
          </span>
          <Button size="sm" onClick={onTakeover} disabled={busy}><Headset aria-hidden />Take over now</Button>
        </div>
      )}
      {aiOnCall && (
        <p className="mx-space-md mt-space-md rounded-lg bg-warning-bg px-space-md py-space-sm text-label-sm text-warning-text">
          {IS_SANDBOX ? "Sandbox: speak" : "Speak"} as the customer into your microphone. The AI cannot see your screen.
        </p>
      )}

      <ol ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-space-sm overflow-y-auto p-space-md">
        {session.turns.length === 0 && !voice.botCaption && (
          <li className="m-auto flex flex-col items-center gap-space-sm text-center text-body-sm text-on-surface-variant">
            {phase === "connecting" ? <Loader2 aria-hidden className="size-5 animate-spin text-primary" /> : <Bot aria-hidden className="size-5 text-primary" />}
            {phase === "connecting" ? "Connecting to the voice agent…" : "The transcript will appear here as the call happens."}
          </li>
        )}
        {session.turns.map((t) => <TurnRow key={t.seq} turn={t} agentName={agentName} />)}
        {voice.userCaption && (
          <li className="rounded-lg border border-dashed border-divider p-space-md text-body-md text-on-surface-variant italic">{voice.userCaption}…</li>
        )}
        {voice.botCaption && (
          <li className="rounded-lg border border-dashed border-lang-border/50 bg-lang-bg/40 p-space-md text-body-md text-on-surface">
            <span className="mr-space-sm text-label-xs text-secondary">{voice.botSpeaking ? "Speaking" : "Preparing"}</span>
            {voice.botCaption}
          </li>
        )}
      </ol>

      {!ended && (
        <footer className="flex flex-col gap-space-md border-t border-divider p-space-md">
          {humanOnCall ? (
            <form
              className="flex flex-col gap-space-md"
              onSubmit={(e) => {
                e.preventDefault();
                onEnd(outcome, note || undefined);
              }}
            >
              <fieldset className="flex flex-col gap-space-sm">
                <legend className="mb-space-sm text-label-md text-on-surface">How did the call end?</legend>
                <RadioGroup value={outcome} onValueChange={(v) => setOutcome(v as Schemas["CallOutcome"])} className="grid grid-cols-3 gap-space-sm">
                  {WRAP_UP.map((o) => (
                    <Label key={o} htmlFor={`o-${o}`} className="flex cursor-pointer items-center gap-space-sm rounded-lg border border-divider p-space-sm text-body-sm font-normal has-data-[state=checked]:border-primary-container has-data-[state=checked]:bg-surface-container-low">
                      <RadioGroupItem id={`o-${o}`} value={o} />
                      {OUTCOME_LABEL[o]}
                    </Label>
                  ))}
                </RadioGroup>
                {(outcome === "payment_link_sent" || outcome === "callback_scheduled") && !session.verified && (
                  <p className="text-label-sm text-warning-text">The customer isn&apos;t verified, so no link or callback will be created; your note is saved.</p>
                )}
              </fieldset>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wrap-note" className="text-label-md text-on-surface">Note for the record</Label>
                <Textarea id="wrap-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} rows={2}
                  placeholder="e.g. Customer will pay tonight after salary credit." />
              </div>
              <Button type="submit" disabled={busy} className="self-end">
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <PhoneOff aria-hidden />} End call
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-end gap-space-sm">
              <Button variant="outline" onClick={onTakeover} disabled={busy || phase !== "live"}>
                <Headset aria-hidden /> Take over call
              </Button>
              <Button variant="destructive" onClick={() => onEnd()} disabled={busy}>
                {busy ? <Loader2 aria-hidden className="animate-spin" /> : <PhoneOff aria-hidden />} End call
              </Button>
            </div>
          )}
        </footer>
      )}
    </section>
  );
}
