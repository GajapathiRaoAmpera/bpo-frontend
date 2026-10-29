import { AudioWaveform } from "lucide-react";

import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("flex size-8 items-center justify-center rounded-lg bg-primary text-on-primary", className)}>
      <AudioWaveform aria-hidden className="size-[18px]" />
    </span>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-space-md">
      <BrandMark className={inverted ? "bg-on-primary text-primary" : undefined} />
      <div className="flex flex-col">
        <span className={cn("text-headline-sm leading-none", inverted ? "text-on-primary" : "text-primary")}>
          AssureVoice
        </span>
        <span
          className={cn(
            "text-label-xs uppercase tracking-wider",
            inverted ? "text-on-primary/70" : "text-on-surface-variant",
          )}
        >
          Enterprise AI Ops
        </span>
      </div>
    </div>
  );
}
