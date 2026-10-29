import { cn } from "@/lib/utils";

// DESIGN.md status / language badges: full pill, label-xs, tinted fill + border + text.
const TONES = {
  success: "border-success-border bg-success-bg text-success-text",
  warning: "border-warning-border bg-warning-bg text-warning-text",
  danger: "border-danger-border bg-danger-bg text-danger-text",
  neutral: "border-neutral-border bg-neutral-bg text-neutral-text",
  lang: "border-lang-border bg-lang-bg text-lang-text",
  info: "border-transparent bg-surface-container-high text-primary",
  live: "border-transparent bg-secondary-container/50 text-secondary",
} as const;

export type PillTone = keyof typeof TONES;

export function Pill({ tone = "neutral", pulse, className, children }: {
  tone?: PillTone;
  pulse?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex h-5.5 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-label-xs whitespace-nowrap", TONES[tone], className)}>
      {pulse && <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}
