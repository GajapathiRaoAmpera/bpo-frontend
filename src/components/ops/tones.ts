import type { PillTone } from "@/components/common/pill";
import type { Schemas } from "@/lib/api";

export const OUTCOME_TONE: Record<Schemas["CallOutcome"], PillTone> = {
  payment_link_sent: "success", renewed: "success", callback_scheduled: "info", escalated: "danger",
  info_provided: "neutral", not_interested: "warning", no_answer: "neutral",
};
export const SENTIMENT_TONE: Record<Schemas["Sentiment"], PillTone> = { positive: "success", neutral: "neutral", negative: "danger" };
export const PRIORITY_TONE: Record<Schemas["Priority"], PillTone> = { urgent: "danger", high: "warning", medium: "info", low: "neutral" };
export const FOLLOWUP_TONE: Record<Schemas["FollowupStatus"], PillTone> = { scheduled: "info", sent: "live", done: "success", cancelled: "neutral" };

export const FOLLOWUP_KIND_LABEL: Record<Schemas["FollowupKind"], string> = {
  payment_link: "Payment link", callback: "Callback", reminder: "Reminder",
};
export const FOLLOWUP_STATUS_LABEL: Record<Schemas["FollowupStatus"], string> = {
  scheduled: "Scheduled", sent: "Sent (sandbox)", done: "Done", cancelled: "Cancelled",
};
