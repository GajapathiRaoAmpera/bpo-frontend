import type { components } from "@/types/api";

export type Screen = components["schemas"]["Screen"];

// Screen key (from the backend access matrix) -> route. Kept icon-free so proxy.ts stays light.
export const SCREEN_HREF: Record<Screen, string> = {
  dashboard: "/dashboard",
  agent_console: "/agent-console",
  escalations: "/escalations",
  live_monitor: "/live-monitor",
  calls: "/calls",
  customers: "/customers",
  campaigns: "/campaigns",
  followups: "/follow-ups",
  claims: "/claims",
  bot_studio: "/bot-studio",
  approvals: "/approvals",
  qa: "/qa",
  audit: "/audit",
  users: "/admin/users",
  integrations: "/admin/integrations",
};

export function screenForPath(pathname: string): Screen | undefined {
  return (Object.entries(SCREEN_HREF) as [Screen, string][]).find(
    ([, href]) => pathname === href || pathname.startsWith(`${href}/`),
  )?.[0];
}
