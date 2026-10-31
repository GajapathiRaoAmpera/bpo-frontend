import type { LucideIcon } from "lucide-react";

import styles from "./empty-state.module.scss";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <span className={styles.iconWrap}>
        <Icon aria-hidden className={styles.icon} />
      </span>
      <div className={styles.text}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>
      {action}
    </div>
  );
}
