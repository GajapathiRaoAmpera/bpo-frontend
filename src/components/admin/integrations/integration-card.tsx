import { Pill } from "@/components/common/pill";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./integration-card.module.scss";

export function IntegrationCard({ item }: { item: Schemas["IntegrationOut"] }) {
  const connected = item.status === "connected";
  return (
    <li className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          <span className={styles.category}>{item.category}</span>
          <h3 className={styles.name}>{item.name}</h3>
        </div>
        {connected ? <Pill tone="success" pulse>Connected</Pill> : <Pill tone="warning">Pilot integration</Pill>}
      </div>
      <p className={styles.description}>{item.description}</p>
      <p className={styles.status}>
        {connected && item.last_sync_at ? `Last used ${formatDateTime(item.last_sync_at)}` : IS_SANDBOX ? "Not connected in the sandbox" : "Not connected"}
      </p>
    </li>
  );
}
