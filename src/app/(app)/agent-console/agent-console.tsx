"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, PhoneCall, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { LiveCall } from "@/app/(app)/agent-console/live-call";
import { RenewalQueue } from "@/app/(app)/agent-console/renewal-queue";
import { ActionsTimeline, CallSummary, CustomerCard } from "@/app/(app)/agent-console/side-panels";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { useVoiceCall } from "@/hooks/use-voice-call";
import { api, type Schemas, unwrap } from "@/lib/api";
import { OUTCOME_LABEL } from "@/lib/labels";

export function AgentConsole() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [selected, setSelected] = useState<Schemas["QueueItem"] | null>(null);
  const [callId, setCallId] = useState<number | null>(null);

  const sessionKey = ["voice", "session", callId] as const;
  const refreshSession = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["voice", "session", callId] }),
    [queryClient, callId],
  );
  const voice = useVoiceCall(refreshSession);

  const { data: session } = useQuery({
    queryKey: sessionKey,
    queryFn: () => unwrap(api.GET("/api/v1/voice/sessions/{call_id}", { params: { path: { call_id: callId! } } })),
    enabled: callId !== null,
    // Poll while the call or its analysis is running; stop once the summary is in.
    refetchInterval: (q) => (q.state.data && q.state.data.ended_at && !q.state.data.analysis_pending ? false : 1500),
  });

  const start = useMutation({
    mutationFn: async ({ mode, policyId }: { mode: Schemas["CallMode"]; policyId?: number }) => {
      const created = await unwrap(api.POST("/api/v1/voice/sessions", { body: { mode, policy_id: policyId ?? null } }));
      queryClient.setQueryData(["voice", "session", created.call_id], created);
      setCallId(created.call_id);
      try {
        await voice.connect(created.call_id);
      } catch {
        // Release the call server-side so the agent can retry immediately.
        await unwrap(api.POST("/api/v1/voice/sessions/{call_id}/end", { params: { path: { call_id: created.call_id } }, body: {} })).catch(() => undefined);
      }
      return created;
    },
    onError: (e) => toast.error(e.message),
  });

  const takeover = useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/voice/sessions/{call_id}/takeover", { params: { path: { call_id: callId! } } })),
    onSuccess: async (s) => {
      queryClient.setQueryData(sessionKey, s);
      await voice.disconnect();
      toast.success("You're on the call. The AI assistant has left.");
    },
    onError: (e) => toast.error(e.message),
  });

  const end = useMutation({
    mutationFn: ({ outcome, note }: { outcome?: Schemas["CallOutcome"]; note?: string }) =>
      unwrap(api.POST("/api/v1/voice/sessions/{call_id}/end", {
        params: { path: { call_id: callId! } }, body: { outcome: outcome ?? null, note: note ?? null },
      })),
    onSuccess: async (s, { outcome }) => {
      queryClient.setQueryData(sessionKey, s);
      await voice.disconnect();
      void queryClient.invalidateQueries({ queryKey: ["voice", "queue"] });
      toast.success(outcome ? `Call ended: ${OUTCOME_LABEL[outcome]}` : "Call ended. Writing the summary…");
    },
    onError: (e) => toast.error(e.message),
  });

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
      <div className="grid grid-cols-12 items-start gap-space-lg">
        <div className="col-span-3">
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
        <div className="col-span-6">
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
        <div className="col-span-3 flex flex-col gap-space-lg">
          {callDone && <CallSummary session={session} />}
          <CustomerCard session={session} preview={session ? null : selected} />
          <ActionsTimeline session={session} />
        </div>
      </div>
    </>
  );
}
