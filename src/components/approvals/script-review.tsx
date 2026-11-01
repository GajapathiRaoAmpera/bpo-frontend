"use client";

import { Decision } from "@/components/approvals/decision";
import { useDecide } from "@/components/approvals/use-approvals";
import { Pill } from "@/components/common/pill";
import { MODE_LABEL, Panel } from "@/components/maker-checker/shared";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./script-review.module.scss";

export function ScriptReview({ item, checks }: { item: Schemas["ScriptApproval"]; checks: string[] }) {
  const { script: s, base, diff } = item;
  const name = `${s.name} v${s.version}`;
  const decide = useDecide("script", s.id, name);
  const changed = diff.filter((d) => d.tag !== "equal").length;

  return (
    <>
      <Panel className={styles.main} title={`Changes · ${MODE_LABEL[s.mode]}`} action={<Pill tone="info">{changed} lines changed</Pill>}>
        <div className={styles.diff}>
          <div className={styles.diffHead}>
            <span className={styles.diffHeadCell}>{base ? `Live · v${base.version}` : "No approved version"}</span>
            <span className={cn(styles.diffHeadCell, styles.rightCell)}>Proposed · v{s.version}</span>
          </div>
          <div className={styles.diffBody}>
            {diff.map((d, i) => (
              <div key={i} className={styles.diffRow}>
                <span className={cn(styles.diffCell, (d.tag === "replace" || d.tag === "delete") && styles.removed)}>
                  {d.left !== null && d.tag !== "equal" && <span className="sr-only">Removed: </span>}{d.left ?? ""}
                </span>
                <span className={cn(styles.diffCell, styles.rightCell, (d.tag === "replace" || d.tag === "insert") && styles.added)}>
                  {d.right !== null && d.tag !== "equal" && <span className="sr-only">Added: </span>}{d.right ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.caption}>
          By {s.created_by_name}{s.submitted_at && `, submitted ${formatDateTime(s.submitted_at)}`}. The bot keeps running {base ? `v${base.version}` : "nothing"} until this is approved.
        </p>
      </Panel>
      <div className={styles.side}>
        <Decision name={name} checks={checks} onDecide={(approve, body) => decide.mutateAsync({ approve, body })} />
      </div>
    </>
  );
}
