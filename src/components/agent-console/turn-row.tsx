import { Bot, Headset, UserRound, Wrench } from "lucide-react";

import type { Schemas } from "@/lib/api";
import { formatDuration } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./turn-row.module.scss";

export function TurnRow({ turn, agentName }: { turn: Schemas["TurnOut"]; agentName: string }) {
  if (turn.speaker === "tool") {
    return (
      <li className={styles.toolTurn}>
        <Wrench aria-hidden className={styles.toolIcon} />
        <span className={styles.toolTime}>{formatDuration(turn.offset_ms / 1000)}</span>
        {turn.text}
      </li>
    );
  }
  const who = {
    bot: { label: "Vani (AssureVoice AI)", icon: Bot, chip: styles.botChip, row: styles.botRow, name: styles.botName },
    customer: { label: "Customer", icon: UserRound, chip: styles.customerChip, row: styles.customerRow, name: styles.customerName },
    agent: { label: agentName, icon: Headset, chip: styles.agentChip, row: styles.agentRow, name: styles.agentName },
  }[turn.speaker];
  return (
    <li className={cn(styles.turn, who.row)}>
      <div className={styles.turnHead}>
        <span className={cn(styles.chip, who.chip)}>
          <who.icon aria-hidden className={styles.chipIcon} />
        </span>
        <span className={styles.turnTime}>{formatDuration(turn.offset_ms / 1000)}</span>
        <span className={cn(styles.speaker, who.name)}>{who.label}</span>
      </div>
      <p className={styles.turnText}>{turn.text}</p>
    </li>
  );
}
