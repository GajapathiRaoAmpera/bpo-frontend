import type { PillTone } from "@/components/common/pill";
import type { Schemas } from "@/lib/api";

import styles from "./labels.module.scss";

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

// Shared table/select classes for the admin, audit and QA screens.
export const SELECT_CLASS = styles.select;
export const TH = styles.th;
export const TD = styles.td;
