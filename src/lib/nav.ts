import {
  Activity,
  Bot,
  CalendarClock,
  ClipboardCheck,
  Headset,
  History,
  LayoutDashboard,
  type LucideIcon,
  Megaphone,
  Plug,
  ScrollText,
  ShieldCheck,
  Siren,
  UserCog,
  Users,
} from "lucide-react";

import { SCREEN_HREF, type Screen } from "@/lib/routes";

export type NavGroup = "operations" | "governance" | "admin";

export interface NavMeta {
  label: string;
  href: string;
  icon: LucideIcon;
  group: NavGroup;
  description: string;
  phase: number;
}

// Labels, icons and grouping only. Which screens a role sees comes from /api/v1/auth/me.
const META = {
  dashboard: { label: "Executive Dashboard", icon: LayoutDashboard, group: "operations", phase: 3,
    description: "Calls, renewals collected, conversion, sentiment and QA across the contact centre." },
  agent_console: { label: "Agent Console", icon: Headset, group: "operations", phase: 2,
    description: "Run inbound and renewal calls with the AI voice agent, follow the live transcript and take over when needed." },
  live_monitor: { label: "Live Monitor", icon: Activity, group: "operations", phase: 5,
    description: "Every active AI call on the floor, with sentiment and one-click escalation." },
  escalations: { label: "Escalation Queue", icon: Siren, group: "operations", phase: 3,
    description: "Calls the AI handed to a person, ordered by priority and wait time." },
  calls: { label: "Call History", icon: History, group: "operations", phase: 3,
    description: "Every call with outcome, sentiment, AI summary, transcript and QA score." },
  customers: { label: "Customers & Policies", icon: Users, group: "operations", phase: 3,
    description: "Customer 360: policies, renewals, calls and follow-ups for each policyholder." },
  followups: { label: "Follow-ups", icon: CalendarClock, group: "operations", phase: 3,
    description: "Payment links, callbacks and WhatsApp reminders, scheduled and tracked." },
  campaigns: { label: "Campaigns", icon: Megaphone, group: "governance", phase: 4,
    description: "Renewal campaigns: segment, script and schedule, approved before launch." },
  bot_studio: { label: "Bot Studio", icon: Bot, group: "governance", phase: 4,
    description: "Write and test the voice agent's scripts, then submit them for approval." },
  approvals: { label: "Approvals", icon: ShieldCheck, group: "governance", phase: 4,
    description: "Maker-checker review of scripts and campaigns with a side-by-side diff and compliance checklist." },
  qa: { label: "QA Review", icon: ClipboardCheck, group: "governance", phase: 4,
    description: "Review the AI's 5-point QA score against the transcript and lock evaluations." },
  audit: { label: "Audit Log", icon: ScrollText, group: "admin", phase: 5,
    description: "Every login, customer-data view, change, approval and export, with audited CSV export." },
  users: { label: "Users & Roles", icon: UserCog, group: "admin", phase: 5,
    description: "Manage staff accounts and view the role permission matrix." },
  integrations: { label: "Integrations", icon: Plug, group: "admin", phase: 5,
    description: "Connected services and pilot integrations." },
} satisfies Record<Screen, Omit<NavMeta, "href">>;

export const NAV = Object.fromEntries(
  (Object.keys(META) as Screen[]).map((s) => [s, { ...META[s], href: SCREEN_HREF[s] }]),
) as Record<Screen, NavMeta>;

export const GROUP_LABEL: Record<NavGroup, string> = {
  operations: "Operational Console",
  governance: "Governance",
  admin: "Administration",
};
