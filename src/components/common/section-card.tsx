import { cn } from "@/lib/utils";

import styles from "./section-card.module.scss";

// White module card with a titled header row (optional action on the right) and a padded body.
export function SectionCard({ title, action, children, size = "md", className, headClassName, bodyClassName }: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
  headClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn(styles.card, styles[size], className)}>
      <div className={cn(styles.head, headClassName)}>
        <h2 className={styles.title}>{title}</h2>
        {action}
      </div>
      <div className={cn(styles.body, bodyClassName)}>{children}</div>
    </section>
  );
}
