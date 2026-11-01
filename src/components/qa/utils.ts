export const STATES = [["open", "To review"], ["locked", "Locked"], ["all", "All"]] as const;
export type QAState = (typeof STATES)[number][0];

export const scoreTone = (s: number | null) => (s === null ? "neutral" : s >= 5 ? "success" : s >= 4 ? "warning" : "danger");
