import type { Schemas } from "@/lib/api";

export const PRODUCT_LABEL: Record<Schemas["Product"], string> = {
  motor: "Motor",
  health: "Health",
  term_life: "Term Life",
};

export const LANGUAGE_LABEL: Record<Schemas["Language"], string> = {
  english: "English",
  hindi: "Hindi",
  tamil: "Tamil",
  telugu: "Telugu",
  kannada: "Kannada",
  malayalam: "Malayalam",
};

export const OUTCOME_LABEL: Record<Schemas["CallOutcome"], string> = {
  payment_link_sent: "Payment link sent",
  callback_scheduled: "Callback scheduled",
  escalated: "Escalated",
  renewed: "Renewed",
  not_interested: "Not interested",
  info_provided: "Information provided",
  no_answer: "No answer",
};

export const SENTIMENT_LABEL: Record<Schemas["Sentiment"], string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

export const TOOL_LABEL: Record<string, string> = {
  verify_customer: "Identity check",
  get_policy_details: "Policy lookup",
  send_payment_link: "Payment link",
  schedule_followup: "Callback",
  escalate_to_human: "Escalation",
};

export const QA_LABEL: Record<keyof Pick<Schemas["QAOut"], "ai_disclosure" | "identity_verified" | "correct_figures" | "no_mis_selling" | "polite_close">, string> = {
  ai_disclosure: "AI disclosure & recording notice",
  identity_verified: "Identity verified before details",
  correct_figures: "Figures match policy records",
  no_mis_selling: "No mis-selling",
  polite_close: "Polite close with next steps",
};

/** 125 -> "02:05" */
export const formatDuration = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
