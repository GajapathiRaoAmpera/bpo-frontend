"use client";

import { Headset, Loader2, PhoneOff, Siren } from "lucide-react";

import { CallTranscript } from "@/components/agent-console/call-transcript";
import { LiveCallHeader } from "@/components/agent-console/live-call-header";
import { WrapUpForm } from "@/components/agent-console/wrap-up-form";
import { Button } from "@/components/ui/button";
import type { VoicePhase } from "@/hooks/use-voice-call";
import type { Schemas } from "@/lib/api";
import { IS_SANDBOX } from "@/lib/personas";
import { cn } from "@/lib/utils";

import styles from "./live-call.module.scss";

export function LiveCall({ session, phase, voice, agentName, onTakeover, onEnd, busy }: {
  session: Schemas["SessionOut"];
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
  const escalationRequested = !ended && !session.taken_over && session.turns.some(
    (t) => t.tool_name === "escalate_to_human" && (t.tool_payload?.result as { ok?: boolean } | undefined)?.ok);

  return (
    <section aria-labelledby="live-heading" className={styles.call}>
      <LiveCallHeader session={session} phase={phase} aiOnCall={aiOnCall}
        micOn={voice.micOn} micLevel={voice.micLevel} toggleMic={voice.toggleMic} />

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

      <CallTranscript turns={session.turns} phase={phase} botCaption={voice.botCaption} userCaption={voice.userCaption}
        botSpeaking={voice.botSpeaking} agentName={agentName} />

      {!ended && (
        <footer className={styles.footer}>
          {humanOnCall ? (
            <WrapUpForm verified={session.verified} onEnd={onEnd} busy={busy} />
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
