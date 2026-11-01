"use client";

import { Loader2, MessageSquareText, Play } from "lucide-react";
import { useState } from "react";

import { CompliancePrecheck } from "@/components/bot-studio/compliance-precheck";
import { useTestCall } from "@/components/bot-studio/use-bot-studio";
import { Pill } from "@/components/common/pill";
import { Panel } from "@/components/maker-checker/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schemas } from "@/lib/api";
import { cn } from "@/lib/utils";

import styles from "./test-call-simulator.module.scss";

export function TestCallSimulator({ script, canWrite }: { script: Schemas["ScriptOut"]; canWrite: boolean }) {
  const [says, setSays] = useState("I want to know when my renewal is due.");
  const run = useTestCall(script.id);
  const result = run.data;

  return (
    <div className={styles.simulator}>
      <Panel title="Test call" action={<Pill tone="warning">Simulated</Pill>}>
        {canWrite ? (
          <>
            <div className={styles.field}>
              <Label htmlFor="t-says">Customer says</Label>
              <Input id="t-says" value={says} onChange={(e) => setSays(e.target.value)} maxLength={500} />
            </div>
            <Button variant="ai" disabled={!says.trim() || run.isPending} onClick={() => run.mutate(says)}>
              {run.isPending ? <Loader2 aria-hidden className={styles.spinner} /> : <Play aria-hidden />}Run test call on v{script.version}
            </Button>
          </>
        ) : (
          <p className={styles.muted}>Test calls are run by the Bot Designer.</p>
        )}
        {result ? (
          <ol className={styles.transcript} aria-label="Test call transcript">
            {result.turns.map((t, i) => (
              <li key={i} className={cn(styles.turn, t.speaker === "bot" ? styles.botTurn : styles.customerTurn)}>
                <span className={styles.speaker}>{t.speaker === "bot" ? "Vani (AI)" : "Customer"}</span>
                {t.text}
              </li>
            ))}
          </ol>
        ) : canWrite && (
          <div className={styles.simEmpty}>
            <MessageSquareText aria-hidden className={styles.simEmptyIcon} />
            Run a test to preview the opening of a call with this version.
          </div>
        )}
        {result && <p className={styles.small}>{result.note}</p>}
      </Panel>
      {result && <CompliancePrecheck checks={result.checks} />}
    </div>
  );
}
