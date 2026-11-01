import { Bot, Headset, PhoneCall, ShieldCheck } from "lucide-react";

import { Kpi } from "@/components/live-monitor/kpi";
import type { Schemas } from "@/lib/api";

import styles from "./live-kpis.module.scss";

export function LiveKpis({ calls }: { calls: Schemas["LiveCallRow"][] }) {
  return (
    <div className={styles.kpiGrid}>
      <Kpi label="Active calls" value={calls.length} icon={PhoneCall} note="In progress right now" />
      <Kpi label="AI handling" value={calls.filter((c) => c.bot_connected && !c.taken_over).length} icon={Bot} note="Voice agent connected" />
      <Kpi label="Human on call" value={calls.filter((c) => c.taken_over).length} icon={Headset} note="Taken over by an agent" />
      <Kpi label="Verified callers" value={calls.filter((c) => c.verified).length} icon={ShieldCheck} note="Identity check passed" />
    </div>
  );
}
