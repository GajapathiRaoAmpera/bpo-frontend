"use client";

import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api";

export function useIntegrations() {
  return useQuery({
    queryKey: ["integrations"],
    queryFn: () => unwrap(api.GET("/api/v1/integrations")),
  });
}
