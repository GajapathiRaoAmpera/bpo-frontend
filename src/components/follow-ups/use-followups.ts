import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FOLLOWUP_KIND_LABEL } from "@/components/ops/tones";
import { api, type Schemas, unwrap } from "@/lib/api";

export const PAGE_SIZE = 25;

export function useFollowups(status: Schemas["FollowupStatus"] | null, page: number) {
  return useQuery({
    queryKey: ["followups", { status, page }],
    queryFn: () => unwrap(api.GET("/api/v1/followups", { params: { query: { status, page, page_size: PAGE_SIZE } } })),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000, // picks up messages the 2-minute sandbox timer sends
  });
}

export function usePatchFollowup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: number; to: "done" | "cancelled" }) =>
      unwrap(api.PATCH("/api/v1/followups/{followup_id}", { params: { path: { followup_id: id } }, body: { status: to } })),
    onSuccess: async (f) => {
      await queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast.success(`${FOLLOWUP_KIND_LABEL[f.kind]} for ${f.customer_name} marked ${f.status}`);
    },
    onError: (e) => toast.error(e.message),
  });
}
