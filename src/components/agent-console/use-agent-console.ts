"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { useVoiceCall } from "@/hooks/use-voice-call";
import { api, type Schemas, unwrap } from "@/lib/api";
import { OUTCOME_LABEL } from "@/lib/labels";

type Voice = ReturnType<typeof useVoiceCall>;

export const sessionKey = (callId: number | null) => ["voice", "session", callId] as const;

export function useRenewalQueue() {
  return useQuery({
    queryKey: ["voice", "queue"],
    queryFn: () => unwrap(api.GET("/api/v1/voice/queue")),
  });
}

export function useVoiceSession(callId: number | null) {
  return useQuery({
    queryKey: sessionKey(callId),
    queryFn: () => unwrap(api.GET("/api/v1/voice/sessions/{call_id}", { params: { path: { call_id: callId! } } })),
    enabled: callId !== null,
    // Poll while the call or its analysis is running; stop once the summary is in.
    refetchInterval: (q) => (q.state.data && q.state.data.ended_at && !q.state.data.analysis_pending ? false : 1500),
  });
}

export function useStartCall(voice: Voice, setCallId: (id: number) => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ mode, policyId }: { mode: Schemas["CallMode"]; policyId?: number }) => {
      const created = await unwrap(api.POST("/api/v1/voice/sessions", { body: { mode, policy_id: policyId ?? null } }));
      queryClient.setQueryData(sessionKey(created.call_id), created);
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
}

export function useTakeoverCall(callId: number | null, voice: Voice) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/voice/sessions/{call_id}/takeover", { params: { path: { call_id: callId! } } })),
    onSuccess: async (s) => {
      queryClient.setQueryData(sessionKey(callId), s);
      await voice.disconnect();
      toast.success("You're on the call. The AI assistant has left.");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useEndCall(callId: number | null, voice: Voice) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ outcome, note }: { outcome?: Schemas["CallOutcome"]; note?: string }) =>
      unwrap(api.POST("/api/v1/voice/sessions/{call_id}/end", {
        params: { path: { call_id: callId! } }, body: { outcome: outcome ?? null, note: note ?? null },
      })),
    onSuccess: async (s, { outcome }) => {
      queryClient.setQueryData(sessionKey(callId), s);
      await voice.disconnect();
      void queryClient.invalidateQueries({ queryKey: ["voice", "queue"] });
      toast.success(outcome ? `Call ended: ${OUTCOME_LABEL[outcome]}` : "Call ended. Writing the summary…");
    },
    onError: (e) => toast.error(e.message),
  });
}
