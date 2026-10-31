import { AudioWaveform } from "lucide-react";

import { cn } from "@/lib/utils";

import styles from "./brand.module.scss";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn(styles.mark, className)}>
      <AudioWaveform aria-hidden className={styles.markIcon} />
    </span>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={cn(styles.brand, inverted && styles.inverted)}>
      <BrandMark className={inverted ? styles.markInverted : undefined} />
      <div className={styles.words}>
        <span className={styles.name}>
          AssureVoice
        </span>
        <span className={styles.tagline}>
          Enterprise AI Ops
        </span>
      </div>
    </div>
  );
}
