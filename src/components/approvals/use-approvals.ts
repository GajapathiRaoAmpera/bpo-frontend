import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

const KEY = ["approvals"] as const;

export function useApprovals() {
  return useQuery({ queryKey: KEY, queryFn: () => unwrap(api.GET("/api/v1/approvals")) });
}

export function useDecide(kind: "script" | "campaign", id: number, name: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ approve, body }: { approve: boolean; body: Schemas["ReviewIn"] }): Promise<unknown> => kind === "script"
      ? unwrap(api.POST(approve ? "/api/v1/scripts/{script_id}/approve" : "/api/v1/scripts/{script_id}/reject", { params: { path: { script_id: id } }, body }))
      : unwrap(api.POST(approve ? "/api/v1/campaigns/{campaign_id}/approve" : "/api/v1/campaigns/{campaign_id}/reject", { params: { path: { campaign_id: id } }, body })),
    onSuccess: (_, { approve }) => {
      toast.success(approve ? `Approved “${name}”` : `Sent “${name}” back to its maker`);
      void qc.invalidateQueries({ queryKey: KEY });
      void qc.invalidateQueries({ queryKey: [kind === "script" ? "scripts" : "campaigns"] });
    },
    onError: (e) => toast.error(e.message),
  });
}
