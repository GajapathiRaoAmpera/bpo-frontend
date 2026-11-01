import { cn } from "@/lib/utils";

import styles from "./chart-card.module.scss";

export function ChartCard({ title, description, children, className }: { title: string; description: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(styles.card, className)}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      {children}
    </section>
  );
}
