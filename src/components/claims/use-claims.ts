import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

import { CLAIM_STATUS_LABEL } from "./utils";

export function useClaims(status: Schemas["ClaimStatus"] | null) {
  return useQuery({
    queryKey: ["claims", status],
    queryFn: () => unwrap(api.GET("/api/v1/claims", { params: { query: { status } } })),
  });
}

export function usePatchClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, to }: { id: number; to: Schemas["ClaimStatus"] }) =>
      unwrap(api.PATCH("/api/v1/claims/{claim_id}", { params: { path: { claim_id: id } }, body: { status: to } })),
    onSuccess: async (c) => {
      await queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success(`Claim ${c.claim_no} for ${c.customer_name} is now ${CLAIM_STATUS_LABEL[c.status].toLowerCase()}`);
    },
    onError: (e) => toast.error(e.message),
  });
}
