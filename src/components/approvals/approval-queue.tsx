"use client";

import { Bot, Megaphone } from "lucide-react";

import { QueueButton } from "@/components/approvals/queue-button";
import { MODE_LABEL, Panel } from "@/components/maker-checker/shared";
import type { Schemas } from "@/lib/api";
import { PRODUCT_LABEL } from "@/lib/labels";

import styles from "./approval-queue.module.scss";

export type ApprovalSelection = { kind: "script"; id: number } | { kind: "campaign"; id: number };

export function ApprovalQueue({ scripts, campaigns, activeScriptId, activeCampaignId, onSelect }: {
  scripts: Schemas["ScriptApproval"][];
  campaigns: Schemas["CampaignOut"][];
  activeScriptId: number | undefined;
  activeCampaignId: number | undefined;
  onSelect: (sel: ApprovalSelection) => void;
}) {
  return (
    <Panel title="Queue" className={styles.side}>
      {scripts.map(({ script: s }) => (
        <QueueButton key={`s${s.id}`} active={activeScriptId === s.id} onClick={() => onSelect({ kind: "script", id: s.id })}
          icon={<Bot aria-hidden className={styles.icon} />} title={`${s.name} v${s.version}`}
          meta={`Script · ${MODE_LABEL[s.mode]} · ${s.created_by_name}`} when={s.submitted_at} />
      ))}
      {campaigns.map((c) => (
        <QueueButton key={`c${c.id}`} active={activeCampaignId === c.id} onClick={() => onSelect({ kind: "campaign", id: c.id })}
          icon={<Megaphone aria-hidden className={styles.icon} />} title={c.name}
          meta={`Campaign · ${PRODUCT_LABEL[c.product]} · ${c.created_by_name}`} when={c.submitted_at} />
      ))}
    </Panel>
  );
}
