import { TurnItem } from "@/components/calls/turn-item";
import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import type { Schemas } from "@/lib/api";

import styles from "./call-transcript-card.module.scss";

export function CallTranscriptCard({ turns }: { turns: Schemas["TurnOut"][] }) {
  return (
    <SectionCard title="Transcript" action={<Pill tone="info">{turns.filter((t) => t.speaker !== "tool").length} turns</Pill>}>
      {turns.length === 0
        ? <p className={styles.muted}>No transcript: the customer didn&apos;t answer.</p>
        : <ol className={styles.turns}>{turns.map((t) => <TurnItem key={t.seq} t={t} />)}</ol>}
    </SectionCard>
  );
}
