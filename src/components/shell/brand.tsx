import Image from "next/image";

import { cn } from "@/lib/utils";

import styles from "./brand.module.scss";

export function BrandMark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn(styles.mark, inverted && styles.markInverted, className)}>
      <Image src="/brand/ampera-mark.png" alt="" aria-hidden width={50} height={51} className={styles.markIcon} />
    </span>
  );
}

export function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className={cn(styles.brand, inverted && styles.inverted)}>
      <BrandMark inverted={inverted} />
      <div className={styles.words}>
        <span className={styles.name}>
          Ampera BPO
        </span>
        <span className={styles.tagline}>
          Enterprise AI Ops
        </span>
      </div>
    </div>
  );
}
