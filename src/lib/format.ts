// All user-facing money, dates and times go through here: INR with Indian grouping, IST.
const TZ = "Asia/Kolkata";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: TZ });

/** 125000 -> "₹1,25,000" */
export const formatINR = (amount: number) => inr.format(amount);

/** "2026-10-29" or ISO datetime -> "29 Oct 2026" (IST) */
export const formatDate = (value: string | Date) => day.format(new Date(value));

/** ISO datetime -> "14:38 IST" */
export const formatTime = (value: string | Date) => `${time.format(new Date(value))} IST`;

/** ISO datetime -> "29 Oct 2026, 14:38 IST" */
export const formatDateTime = (value: string | Date) => `${formatDate(value)}, ${formatTime(value)}`;

/** "Divya Krishnan" -> "DK" */
export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("");
