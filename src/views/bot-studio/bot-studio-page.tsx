"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Bot, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ModeTiles } from "@/components/bot-studio/mode-tiles";
import { ScriptEditor } from "@/components/bot-studio/script-editor";
import { TestCallSimulator } from "@/components/bot-studio/test-call-simulator";
import { SCRIPTS_KEY, useScripts } from "@/components/bot-studio/use-bot-studio";
import { VersionList } from "@/components/bot-studio/version-list";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { ErrorBox } from "@/components/maker-checker/shared";
import { useLevel } from "@/components/ops/use-level";
import type { Schemas } from "@/lib/api";

import styles from "./bot-studio-page.module.scss";

export function BotStudioPage() {
  const qc = useQueryClient();
  const canWrite = useLevel("bot_studio") === "full";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data, isLoading, error, refetch } = useScripts();
  const selected = data?.find((s) => s.id === selectedId) ?? data?.find((s) => s.active) ?? data?.[0];

  const refresh = (s: Schemas["ScriptOut"], msg: string) => {
    toast.success(msg);
    setSelectedId(s.id);
    void qc.invalidateQueries({ queryKey: SCRIPTS_KEY });
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Bot Studio"
        description="Write and test the voice agent's system prompts. A new version reaches the bot only after Operations or Compliance approves it."
        badge={!canWrite ? <Pill tone="neutral"><Eye aria-hidden className={styles.viewOnlyIcon} />View only</Pill> : undefined}
      />
      {error && <ErrorBox error={error} onRetry={() => refetch()} />}

      <ModeTiles scripts={data} isLoading={isLoading} />

      <div className={styles.workspace}>
        <VersionList scripts={data} isLoading={isLoading} selectedId={selected?.id} onSelect={setSelectedId} className={styles.versions} />

        <div className={styles.editorCol}>
          {selected ? <ScriptEditor key={selected.id} script={selected} canWrite={canWrite} onSaved={refresh} />
            : !isLoading && <EmptyState icon={Bot} title="No script selected" description="Pick a version on the left to read or edit it." />}
        </div>

        <div className={styles.sideCol}>
          {selected && <TestCallSimulator key={selected.id} script={selected} canWrite={canWrite} />}
        </div>
      </div>
    </div>
  );
}
