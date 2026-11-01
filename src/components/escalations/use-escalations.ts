import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

type Row = Schemas["EscalationRow"];
export type EscalationTab = "active" | "resolved";

export function useEscalations(tab: EscalationTab) {
  return useQuery({
    queryKey: ["escalations", tab],
    queryFn: () => unwrap(api.GET("/api/v1/escalations", { params: { query: { status: tab === "resolved" ? "resolved" : null } } })),
    refetchInterval: tab === "active" ? 15_000 : false,
  });
}

// Invalidate the queue, let the screen update its selection, then toast.
function useDone(msg: string, onDone: (row: Row) => void) {
  const queryClient = useQueryClient();
  return async (row: Row) => {
    await queryClient.invalidateQueries({ queryKey: ["escalations"] });
    onDone(row);
    toast.success(msg);
  };
}

export function useClaimEscalation(onDone: (row: Row) => void) {
  return useMutation({
    mutationFn: (id: number) => unwrap(api.POST("/api/v1/escalations/{escalation_id}/claim", { params: { path: { escalation_id: id } } })),
    onSuccess: useDone("Escalation claimed. It's now assigned to you.", onDone),
    onError: (e) => toast.error(e.message),
  });
}

export function useResolveEscalation(onDone: (row: Row) => void) {
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      unwrap(api.POST("/api/v1/escalations/{escalation_id}/resolve", { params: { path: { escalation_id: id } }, body: { note: note.trim() } })),
    onSuccess: useDone("Escalation resolved", onDone),
    onError: (e) => toast.error(e.message),
  });
}
