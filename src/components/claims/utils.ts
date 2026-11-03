import type { PillTone } from "@/components/common/pill";
import type { Schemas } from "@/lib/api";

type Status = Schemas["ClaimStatus"];

export const CLAIM_STATUSES: Status[] = ["registered", "under_review", "approved", "rejected", "settled"];
export const CLAIM_STATUS_LABEL: Record<Status, string> = {
  registered: "Registered", under_review: "Under review", approved: "Approved", rejected: "Rejected", settled: "Settled",
};
export const CLAIM_TONE: Record<Status, PillTone> = {
  registered: "neutral", under_review: "info", approved: "success", rejected: "danger", settled: "success",
};
// Allowed next steps; rejected and settled are final (the API answers 409).
export const NEXT_STATUS: Record<Status, Status[]> = {
  registered: ["under_review"], under_review: ["approved", "rejected"], approved: ["settled"], rejected: [], settled: [],
};
