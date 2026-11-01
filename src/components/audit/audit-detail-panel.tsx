import { FileSearch, Lock } from "lucide-react";

import { ACTION_LABEL, ROLE_LABEL } from "@/components/admin/labels";
import type { AuditRow } from "@/components/audit/use-audit";
import { Pill } from "@/components/common/pill";
import { formatDateTime } from "@/lib/format";

import styles from "./audit-detail-panel.module.scss";

export function AuditDetailPanel({ row }: { row: AuditRow | undefined }) {
  if (!row) {
    return (
      <div className={styles.placeholder}>
        <FileSearch aria-hidden className={styles.placeholderIcon} />
        <p className={styles.placeholderTitle}>Select an entry</p>
        <p className={styles.placeholderText}>Its full record appears here.</p>
      </div>
    );
  }
  const fields: [string, string][] = [
    ["Timestamp (IST)", formatDateTime(row.ts)],
    ["Timestamp (UTC)", row.ts],
    ["Actor", row.actor_name ?? "Unknown / signed out"],
    ["Role", row.actor_role ? ROLE_LABEL[row.actor_role] : "—"],
    ["Entity", row.entity_type ? `${row.entity_type}${row.entity_id ? ` #${row.entity_id}` : ""}` : "—"],
    ["IP address", row.ip ?? "—"],
  ];
  return (
    <aside aria-label="Audit entry" className={styles.detail}>
      <div className={styles.detailHeader}>
        <span className={styles.eyebrow}>Entry #{row.id}</span>
        <Pill tone="live"><Lock aria-hidden className={styles.lockIcon} /> Append-only</Pill>
      </div>
      <h2 className={styles.heading}>{ACTION_LABEL[row.action]}</h2>
      <dl className={styles.fields}>
        {fields.map(([k, v]) => (
          <div key={k} className={styles.fieldRow}>
            <dt className={styles.fieldKey}>{k}</dt>
            <dd className={styles.fieldValue}>{v}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.detailBlock}>
        <span className={styles.eyebrow}>Detail</span>
        <pre className={styles.raw}>
          {row.detail ? JSON.stringify(row.detail, null, 2) : "No extra detail recorded."}
        </pre>
      </div>
    </aside>
  );
}
