import { Bot, Headset, UserRound, Wrench } from "lucide-react";

import type { Schemas } from "@/lib/api";
import { formatDuration, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./turn-item.module.scss";

const SPEAKER = {
  bot: { label: "AssureVoice AI", icon: Bot, box: styles.turnBot, tag: styles.speakerBot },
  customer: { label: "Customer", icon: UserRound, box: styles.turnCustomer, tag: styles.speakerCustomer },
  agent: { label: "Human agent", icon: Headset, box: styles.turnAgent, tag: styles.speakerAgent },
} as const;

export function TurnItem({ t }: { t: Schemas["TurnOut"] }) {
  if (t.speaker === "tool") {
    // Seeded sample calls store only the tool arguments; only an explicit ok:false is a failure.
    const ok = (t.tool_payload?.result as { ok?: boolean } | undefined)?.ok !== false;
    return (
      <li className={cn(styles.toolTurn, !ok && styles.toolFailed)}>
        <Wrench aria-hidden className={styles.toolIcon} />
        <span className={styles.toolName}>{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}</span>
        <span className={styles.toolText}>{t.text}</span>
        <span className={styles.toolTime}>{formatDuration(t.offset_ms / 1000)}</span>
      </li>
    );
  }
  const s = SPEAKER[t.speaker];
  return (
    <li className={cn(styles.turn, s.box)}>
      <div className={styles.turnHead}>
        <span className={cn(styles.speaker, s.tag)}>{s.label}</span>
        <span className={styles.turnTime}>{formatDuration(t.offset_ms / 1000)}</span>
      </div>
      <p className={styles.text}>{t.text}</p>
    </li>
  );
}
