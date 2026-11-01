import { Kpi } from "@/components/campaigns/kpi";
import { pct } from "@/components/campaigns/utils";
import type { Schemas } from "@/lib/api";

import styles from "./campaign-kpis.module.scss";

export function CampaignKpis({ rows }: { rows: Schemas["CampaignOut"][] }) {
  const live = rows.filter((c) => c.status === "running" || c.status === "completed");
  const sum = (k: "total_targets" | "dialled" | "connected" | "converted") => live.reduce((s, c) => s + c[k], 0);
  const [targets, dialled, connected, converted] = [sum("total_targets"), sum("dialled"), sum("connected"), sum("converted")];

  return (
    <div className={styles.kpiGrid}>
      <Kpi label="Total targets" value={targets.toLocaleString("en-IN")} ratio={100} foot={`${live.length} launched campaigns`} />
      <Kpi label="Dialled" value={dialled.toLocaleString("en-IN")} ratio={pct(dialled, targets)} foot={`${pct(dialled, targets)}% of targets`} />
      <Kpi label="Connected" value={connected.toLocaleString("en-IN")} ratio={pct(connected, dialled)} foot={`${pct(connected, dialled)}% answer rate`} />
      <Kpi label="Converted" value={converted.toLocaleString("en-IN")} ratio={pct(converted, connected)} foot={`${pct(converted, connected)}% of connected`} />
      <Kpi label="Awaiting approval" value={String(rows.filter((c) => c.status === "pending").length)}
        ratio={0} foot="Checked by Operations or Compliance" />
    </div>
  );
}
