import { CircleCheck, CircleX } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { CHECK_LABEL, Panel } from "@/components/maker-checker/shared";
import { cn } from "@/lib/utils";

import styles from "./compliance-precheck.module.scss";

export function CompliancePrecheck({ checks }: { checks: Record<string, boolean> }) {
  return (
    <Panel title="Compliance pre-check" action={
      <Pill tone={Object.values(checks).every(Boolean) ? "success" : "warning"}>
        {Object.values(checks).filter(Boolean).length}/{Object.keys(checks).length} found
      </Pill>
    }>
      <ul className={styles.checks}>
        {Object.entries(checks).map(([k, ok]) => (
          <li key={k} className={styles.check}>
            {ok ? <CircleCheck aria-hidden className={cn(styles.checkIcon, styles.found)} /> : <CircleX aria-hidden className={cn(styles.checkIcon, styles.missing)} />}
            <span className={styles.checkLabel}>{CHECK_LABEL[k] ?? k}</span>
            <span className={styles.small}>{ok ? "Found" : "Missing"}</span>
          </li>
        ))}
      </ul>
      <p className={styles.small}>Keyword check of the prompt. The approver makes the final call.</p>
    </Panel>
  );
}
