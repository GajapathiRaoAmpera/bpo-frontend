"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bot, PhoneCall, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

import { ActionsTimeline } from "@/components/agent-console/actions-timeline";
import { CallSummary } from "@/components/agent-console/call-summary";
import { CustomerCard } from "@/components/agent-console/customer-card";
import { LiveCall } from "@/components/agent-console/live-call";
import { RenewalQueue } from "@/components/agent-console/renewal-queue";
import {
  sessionKey, useEndCall, useStartCall, useTakeoverCall, useVoiceSession,
} from "@/components/agent-console/use-agent-console";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { useVoiceCall } from "@/hooks/use-voice-call";
import type { Schemas } from "@/lib/api";

import styles from "./agent-console-page.module.scss";

export function AgentConsolePage() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [selected, setSelected] = useState<Schemas["QueueItem"] | null>(null);
  const [callId, setCallId] = useState<number | null>(null);

  const refreshSession = useCallback(
    () => queryClient.invalidateQueries({ queryKey: sessionKey(callId) }),
    [queryClient, callId],
  );
  const voice = useVoiceCall(refreshSession);

  const { data: session } = useVoiceSession(callId);
  const start = useStartCall(voice, setCallId);
  const takeover = useTakeoverCall(callId, voice);
  const end = useEndCall(callId, voice);

  function nextCall() {
    setCallId(null);
    setSelected(null);
    voice.resetToIdle();
  }

  const inCall = session !== undefined && !session.ended_at;
  const callDone = session?.ended_at;

  return (
    <>
      <PageHeader
        title="Agent Console"
        description="Run renewal and inbound calls with the AI voice agent. Follow the live transcript and take over at any point."
        badge={inCall ? <Pill tone="live" pulse>Call in progress</Pill> : undefined}
        actions={callDone ? <Button onClick={nextCall}><RotateCcw aria-hidden />Start next call</Button> : undefined}
      />
      <div className={styles.layout}>
        <div className={styles.queueCol}>
          <RenewalQueue
            selectedId={selected?.policy_id ?? null}
            onSelect={setSelected}
            onStart={(mode, policyId) => {
              if (mode === "inbound") setSelected(null);
              start.mutate({ mode, policyId });
            }}
            busy={start.isPending}
            disabled={inCall}
          />
        </div>
        <div className={styles.callCol}>
          {session ? (
            <LiveCall
              session={session}
              phase={voice.phase}
              voice={voice}
              agentName={me?.user.full_name ?? "Agent"}
              onTakeover={() => takeover.mutate()}
              onEnd={(outcome, note) => end.mutate({ outcome, note })}
              busy={takeover.isPending || end.isPending}
            />
          ) : (
            <EmptyState
              icon={start.isPending ? PhoneCall : Bot}
              title={start.isPending ? "Starting the call…" : "No call in progress"}
              description="Choose a policy from the renewal queue and start a renewal call, or take an inbound call. The AI uses the latest approved script."
            />
          )}
        </div>
        <div className={styles.sideCol}>
          {callDone && <CallSummary session={session} />}
          <CustomerCard session={session} preview={session ? null : selected} />
          <ActionsTimeline session={session} />
        </div>
      </div>
    </>
  );
}
