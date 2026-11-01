import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api";

export const DAYS = 30;

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary", DAYS],
    queryFn: () => unwrap(api.GET("/api/v1/dashboard/summary", { params: { query: { days: DAYS } } })),
  });
}

export function useDashboardTrends() {
  return useQuery({
    queryKey: ["dashboard", "trends", DAYS],
    queryFn: () => unwrap(api.GET("/api/v1/dashboard/trends", { params: { query: { days: DAYS } } })),
  });
}
