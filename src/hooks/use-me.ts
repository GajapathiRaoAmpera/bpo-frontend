"use client";

import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api";

export const ME_KEY = ["auth", "me"] as const;

export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => unwrap(api.GET("/api/v1/auth/me")),
    staleTime: 5 * 60_000,
    retry: false,
  });
}
