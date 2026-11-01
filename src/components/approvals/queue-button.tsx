"use client";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./queue-button.module.scss";

export function QueueButton({ active, onClick, icon, title, meta, when }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; meta: string; when: string | null;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={cn(styles.queueButton, active && styles.queueButtonActive)}>
      <span className={styles.queueIcon}>{icon}</span>
      <span className={styles.queueText}>
        <span className={styles.queueTitle}>{title}</span>
        <span className={styles.queueMeta}>{meta}</span>
        {when && <span className={styles.queueWhen}>Submitted {formatDateTime(when)}</span>}
      </span>
    </button>
  );
}
