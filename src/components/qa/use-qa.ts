import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { QAState } from "@/components/qa/utils";
import { api, type Schemas, unwrap } from "@/lib/api";

export const PAGE_SIZE = 15;

export function useQAQueue(state: QAState, page: number) {
  return useQuery({
    queryKey: ["qa", "queue", state, page],
    queryFn: () => unwrap(api.GET("/api/v1/qa/queue", { params: { query: { state, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
  });
}

export function useQADetail(callId: number) {
  return useQuery({
    queryKey: ["qa", "detail", callId],
    queryFn: () => unwrap(api.GET("/api/v1/qa/{call_id}", { params: { path: { call_id: callId } } })),
  });
}

// `body` is read at mutate time, so pass the current checks and note on every render.
export function useSaveQAReview(callId: number, body: Omit<Schemas["QAReviewIn"], "lock">) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lock: boolean) => unwrap(api.PUT("/api/v1/qa/{call_id}", {
      params: { path: { call_id: callId } }, body: { ...body, lock },
    })),
    onSuccess: (d, lock) => {
      qc.setQueryData(["qa", "detail", callId], d);
      void qc.invalidateQueries({ queryKey: ["qa", "queue"] });
      toast.success(lock ? `Evaluation for ${d.call_ref} locked` : `Review saved for ${d.call_ref}`);
    },
    onError: (e) => toast.error(e.message),
  });
}
