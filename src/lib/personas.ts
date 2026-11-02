// Build-time switch: production hides the sandbox banner and persona picker.
export const IS_SANDBOX = process.env.NEXT_PUBLIC_APP_ENV !== "production";

import type { Schemas } from "@/lib/api";

// Sandbox sign-in helper only. Mirrors PERSONAS in bpo-backend/app/seed/__init__.py; passwords are never shown.
export const SANDBOX_PERSONAS: { name: string; role: Schemas["Role"]; roleLabel: string; title: string }[] = [
  { name: "Ravi Shankar", role: "super_admin", roleLabel: "Super Admin", title: "IT Administrator" },
  { name: "Anitha Raman", role: "ops_manager", roleLabel: "Operations Manager", title: "Head of Operations" },
  { name: "Karthik Subramanian", role: "team_lead", roleLabel: "Team Lead", title: "Floor Supervisor" },
  { name: "Divya Krishnan", role: "human_agent", roleLabel: "Human Agent", title: "Senior Service Executive" },
  { name: "Suresh Babu", role: "campaign_manager", roleLabel: "Campaign Manager", title: "Renewals Manager" },
  { name: "Meera Iyer", role: "bot_designer", roleLabel: "Bot Designer", title: "Conversation Designer" },
  { name: "Prakash Natarajan", role: "qa_analyst", roleLabel: "QA Analyst", title: "Quality Analyst" },
  { name: "Lakshmi Venkatesh", role: "compliance_officer", roleLabel: "Compliance Officer", title: "Compliance Officer" },
];

export const personaEmail = (name: string) => {
  const [first, ...rest] = name.toLowerCase().split(" ");
  return `${first}.${rest.join("")}@sandbox.amperabpo.in`;
};
