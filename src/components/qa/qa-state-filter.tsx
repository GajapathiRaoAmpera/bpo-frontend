"use client";

import { type QAState, STATES } from "@/components/qa/utils";
import { Button } from "@/components/ui/button";

import styles from "./qa-state-filter.module.scss";

export function QAStateFilter({ state, onState }: { state: QAState; onState: (s: QAState) => void }) {
  return (
    <div role="group" aria-label="Filter evaluations" className={styles.filter}>
      {STATES.map(([key, label]) => (
        <Button key={key} size="sm" variant={state === key ? "default" : "ghost"} aria-pressed={state === key}
          onClick={() => onState(key)}>{label}</Button>
      ))}
    </div>
  );
}
