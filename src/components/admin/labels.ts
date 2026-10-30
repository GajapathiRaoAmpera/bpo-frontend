import type { PillTone } from "@/components/common/pill";
import type { Schemas } from "@/lib/api";

// Display labels only; which role can do what comes from the API (/auth/me, /rbac/matrix).
export const ROLE_LABEL: Record<Schemas["Role"], string> = {
  super_admin: "Super Admin",
  ops_manager: "Operations Manager",
  team_lead: "Team Lead",
  human_agent: "Human Agent",
  campaign_manager: "Campaign Manager",
  bot_designer: "Bot Designer",
  qa_analyst: "QA Analyst",
  compliance_officer: "Compliance Officer",
};

export const ACTION_LABEL: Record<Schemas["AuditAction"], string> = {
  login: "Sign in",
  login_failed: "Failed sign-in",
  logout: "Sign out",
  view_customer: "Customer viewed",
  create: "Created",
  update: "Updated",
  delete: "Deleted / deactivated",
  submit: "Submitted",
  approve: "Approved",
  reject: "Rejected",
  launch: "Launched",
  export: "Exported",
  takeover: "Call taken over",
  call_start: "Call started",
  call_end: "Call ended",
};

export const ACTION_TONE: Partial<Record<Schemas["AuditAction"], PillTone>> = {
  login_failed: "danger",
  delete: "danger",
  reject: "danger",
  approve: "success",
  launch: "success",
  export: "warning",
  view_customer: "info",
  takeover: "warning",
};

export const LEVEL_LABEL: Record<Schemas["Level"], string> = {
  full: "Full",
  view: "View",
  approve: "Approve",
  masked: "Masked",
  own: "Own",
};

// Native <select> styled like the Input primitive (no shadcn Select needed for plain option lists).
export const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-divider bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none focus-visible:border-primary-container focus-visible:ring-3 focus-visible:ring-primary-container/12 disabled:cursor-not-allowed disabled:opacity-50";

export const TH = "h-9 px-space-md text-left text-label-xs tracking-wider text-on-surface-variant uppercase";
export const TD = "px-space-md py-space-sm align-middle";
