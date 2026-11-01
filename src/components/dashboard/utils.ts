import { formatDate } from "@/lib/format";

export const C = { primary: "var(--color-primary)", secondary: "var(--color-secondary)", grid: "var(--color-divider)", text: "var(--color-on-surface-variant)" };
export const n = (v: number) => v.toLocaleString("en-IN");
export const shortDay = (d: string) => formatDate(d).split(" ").slice(0, 2).join(" ");
