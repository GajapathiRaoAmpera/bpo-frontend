"use client";

import { useMe } from "@/hooks/use-me";
import type { Screen } from "@/lib/routes";

/** The role's access level for a screen, from /auth/me (UI mirror only; the API enforces it). */
export function useLevel(screen: Screen) {
  return useMe().data?.nav.find((n) => n.screen === screen)?.level;
}
