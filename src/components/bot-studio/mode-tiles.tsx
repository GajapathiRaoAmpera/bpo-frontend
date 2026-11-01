import { Bot } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { MODE_LABEL } from "@/components/maker-checker/shared";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

import styles from "./mode-tiles.module.scss";

const MODES: Schemas["CallMode"][] = ["renewal", "inbound"];

// Per-mode status: which version is live on the bot and how many wait for approval.
export function ModeTiles({ scripts, isLoading }: { scripts: Schemas["ScriptOut"][] | undefined; isLoading: boolean }) {
  return (
    <div className={styles.modeGrid}>
      {MODES.map((mode) => {
        const active = scripts?.find((s) => s.mode === mode && s.active);
        const waiting = scripts?.filter((s) => s.mode === mode && s.status === "pending").length ?? 0;
        return (
          <div key={mode} className={styles.modeTile}>
            <span className={styles.modeIcon}><Bot aria-hidden /></span>
            <div className={styles.modeText}>
              <span className={styles.modeTitle}>Vani · {MODE_LABEL[mode]}</span>
              <span className={styles.modeMeta}>
                {isLoading ? "Loading…" : active ? `${active.name} v${active.version} · approved ${active.reviewed_at ? formatDateTime(active.reviewed_at) : ""}` : "No approved script: calls can't start"}
              </span>
            </div>
            {active && <Pill tone="success">Live on bot</Pill>}
            {waiting > 0 && <Pill tone="warning">{waiting} awaiting approval</Pill>}
          </div>
        );
      })}
    </div>
  );
}
