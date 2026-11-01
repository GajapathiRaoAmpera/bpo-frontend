"use client";

import { Pill } from "@/components/common/pill";
import { MODE_LABEL, Panel, STATUS } from "@/components/maker-checker/shared";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import styles from "./version-list.module.scss";

const MODES: Schemas["CallMode"][] = ["renewal", "inbound"];

export function VersionList({ scripts, isLoading, selectedId, onSelect, className }: {
  scripts: Schemas["ScriptOut"][] | undefined;
  isLoading: boolean;
  selectedId: number | undefined;
  onSelect: (id: number) => void;
  className?: string;
}) {
  return (
    <Panel title="Versions" className={className}>
      {isLoading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className={styles.versionSkeleton} />)}
      {scripts?.length === 0 && <p className={styles.muted}>No scripts yet.</p>}
      {MODES.map((mode) => scripts?.some((s) => s.mode === mode) && (
        <div key={mode} className={styles.versionGroup}>
          <span className={styles.groupLabel}>{MODE_LABEL[mode]}</span>
          {scripts.filter((s) => s.mode === mode).map((s) => (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)} aria-pressed={s.id === selectedId}
              className={cn(styles.version, s.id === selectedId && styles.versionSelected)}>
              <div className={styles.versionHead}>
                <span className={styles.versionName}>v{s.version} · {s.name}</span>
                {s.active ? <Pill tone="success">Live</Pill> : <Pill tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Pill>}
              </div>
              <span className={styles.small}>{s.created_by_name} · {formatDateTime(s.created_at)}</span>
            </button>
          ))}
        </div>
      ))}
    </Panel>
  );
}
