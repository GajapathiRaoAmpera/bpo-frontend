import type { Schemas } from "@/lib/api";

export const PRIORITY_LABEL: Record<Schemas["Priority"], string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };
export const NOTE_ERROR = "Add a short resolution note (at least 3 characters)";
