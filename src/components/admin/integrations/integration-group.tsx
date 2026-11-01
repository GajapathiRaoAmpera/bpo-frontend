import { IntegrationCard } from "@/components/admin/integrations/integration-card";
import type { Schemas } from "@/lib/api";

import styles from "./integration-group.module.scss";

export function IntegrationGroup({ title, note, items }: { title: string; note: string; items: Schemas["IntegrationOut"][] }) {
  return (
    <section aria-label={title} className={styles.group}>
      <div className={styles.groupHeader}>
        <h2 className={styles.groupTitle}>{title}</h2>
        <span className={styles.groupNote}>{note}</span>
      </div>
      <ul className={styles.grid}>
        {items.map((i) => <IntegrationCard key={i.key} item={i} />)}
      </ul>
    </section>
  );
}
