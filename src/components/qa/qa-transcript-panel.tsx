import { Panel } from "@/components/maker-checker/shared";
import type { Schemas } from "@/lib/api";
import { formatTime } from "@/lib/format";
import { formatDuration, TOOL_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./qa-transcript-panel.module.scss";

export function QATranscriptPanel({ d, className }: { d: Schemas["QADetail"]; className?: string }) {
  const start = new Date(d.started_at).getTime();
  return (
    <Panel className={className} title={`Transcript · ${d.call_ref}`} action={<span className={styles.duration}>{formatDuration(d.duration_sec)}</span>}>
      {d.summary && <p className={styles.summary}>{d.summary}</p>}
      <ol className={styles.transcript} aria-label="Call transcript">
        {d.turns.length === 0 && <li className={styles.empty}>No transcript was captured for this call.</li>}
        {d.turns.map((t) => t.speaker === "tool" ? (
          <li key={t.seq} className={styles.toolTurn}>
            <span className={styles.rule} />{TOOL_LABEL[t.tool_name ?? ""] ?? t.tool_name}: {t.text}<span className={styles.rule} />
          </li>
        ) : (
          <li key={t.seq} className={cn(styles.turn,
            t.speaker === "bot" ? styles.turnBot : t.speaker === "agent" ? styles.turnAgent : styles.turnCustomer)}>
            <span className={styles.speaker}>
              {t.speaker === "bot" ? "Vani (AI)" : t.speaker === "agent" ? "Human agent" : "Customer"} · {formatTime(new Date(start + t.offset_ms))}
            </span>
            {t.text}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
