import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { api, unwrap } from "@/lib/api";

export function useLiveCalls() {
  return useQuery({
    queryKey: ["live", "calls"],
    queryFn: () => unwrap(api.GET("/api/v1/live/calls")),
    refetchInterval: 5000,
  });
}

export function useCallSession(callId: number) {
  return useQuery({
    queryKey: ["voice", "session", callId],
    queryFn: () => unwrap(api.GET("/api/v1/voice/sessions/{call_id}", { params: { path: { call_id: callId } } })),
    refetchInterval: (q) => (q.state.data?.ended_at ? false : 2000),
  });
}

export function useNow() {
  // Starts at 0 so the prerender doesn't read the clock; the first tick sets it.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}
