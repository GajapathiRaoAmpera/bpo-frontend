import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api";

export const AI_DAYS = [7, 30, 90] as const;
export type AiDays = (typeof AI_DAYS)[number];

export function useAiUsage(days: AiDays) {
  return useQuery({
    queryKey: ["ai-usage", days],
    queryFn: () => unwrap(api.GET("/api/v1/ai-usage", { params: { query: { days } } })),
  });
}
