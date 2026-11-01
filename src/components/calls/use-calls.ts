import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { api, ApiError, type Schemas, unwrap } from "@/lib/api";

export const PAGE_SIZE = 25;

export function useCalls({ query, outcome, page }: { query: string; outcome: Schemas["CallOutcome"] | null; page: number }) {
  return useQuery({
    queryKey: ["calls", { query, outcome, page }],
    queryFn: () => unwrap(api.GET("/api/v1/calls", { params: { query: { q: query || null, outcome, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useCall(callId: number) {
  return useQuery({
    queryKey: ["calls", "detail", callId],
    queryFn: () => unwrap(api.GET("/api/v1/calls/{call_id}", { params: { path: { call_id: callId } } })),
    enabled: Number.isInteger(callId),
    retry: (count, e) => !(e instanceof ApiError && e.status === 404) && count < 2,
  });
}
