import { Stat } from "@/components/escalations/stat";
import type { Schemas } from "@/lib/api";

import styles from "./escalation-stats.module.scss";

// `active` is undefined while loading or on the resolved tab: every stat shows "—".
export function EscalationStats({ active, meId }: { active: Schemas["EscalationRow"][] | undefined; meId: number | undefined }) {
  return (
    <div className={styles.statGrid}>
      <Stat label="Active" value={active ? active.length : "—"} />
      <Stat label="Urgent" value={active ? active.filter((e) => e.priority === "urgent").length : "—"} urgent />
      <Stat label="Unclaimed" value={active ? active.filter((e) => e.status === "open").length : "—"} />
      <Stat label="Assigned to me" value={active ? active.filter((e) => e.assigned_to === meId).length : "—"} />
    </div>
  );
}
