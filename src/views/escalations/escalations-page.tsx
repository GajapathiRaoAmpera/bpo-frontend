"use client";

import { Hand } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill } from "@/components/common/pill";
import { EscalationActions } from "@/components/escalations/escalation-actions";
import { EscalationBrief } from "@/components/escalations/escalation-brief";
import { EscalationOverview } from "@/components/escalations/escalation-overview";
import { EscalationQueue } from "@/components/escalations/escalation-queue";
import { EscalationResolution } from "@/components/escalations/escalation-resolution";
import { EscalationStats } from "@/components/escalations/escalation-stats";
import {
  type EscalationTab, useClaimEscalation, useEscalations, useResolveEscalation,
} from "@/components/escalations/use-escalations";
import { NOTE_ERROR } from "@/components/escalations/utils";
import { useLevel } from "@/components/ops/use-level";
import { useMe } from "@/hooks/use-me";
import type { Schemas } from "@/lib/api";

import styles from "./escalations-page.module.scss";

export function EscalationsPage() {
  const { data: me } = useMe();
  const canAct = useLevel("escalations") === "full";
  const [tab, setTab] = useState<EscalationTab>("active");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useEscalations(tab);
  const selected = data?.find((e) => e.id === selectedId) ?? data?.[0];

  const done = (row: Schemas["EscalationRow"]) => {
    setSelectedId(row.status === "resolved" ? null : row.id);
    setNote("");
  };
  const claim = useClaimEscalation(done);
  const resolve = useResolveEscalation(done);

  function submitResolve() {
    if (note.trim().length < 3) return setNoteError(NOTE_ERROR);
    if (selected) resolve.mutate({ id: selected.id, note });
  }

  const mine = selected?.assigned_to === me?.user.id;
  const takenByOther = selected?.assigned_to != null && !mine;
  const isLead = me?.user.role === "team_lead";

  return (
    <div className={styles.page}>
      <PageHeader
        title="Escalation Queue"
        badge={data && tab === "active" ? <Pill tone="danger" pulse>{data.length} waiting for a person</Pill> : undefined}
        description="Calls the AI handed to a person, most urgent and longest waiting first. Claim one, contact the customer, then resolve it with a note."
      />

      <EscalationStats active={tab === "active" ? data : undefined} meId={me?.user.id} />

      <div className={styles.layout}>
        <EscalationQueue className={styles.queue} tab={tab} onTab={(t) => { setTab(t); setSelectedId(null); }}
          data={data} isLoading={isLoading} error={error} onRetry={() => refetch()} selectedId={selected?.id}
          onSelect={(id) => { setSelectedId(id); setNote(""); setNoteError(null); }} />

        <div className={styles.detail}>
          {!selected ? (
            !isLoading && <EmptyState icon={Hand} title="Select an escalation" description="Pick a customer from the queue to see the AI's hand-off context." />
          ) : <>
            <EscalationOverview escalation={selected} />
            <EscalationBrief summary={selected.call_summary} />
            {selected.status === "resolved" ? (
              <EscalationResolution escalation={selected} />
            ) : canAct ? (
              <EscalationActions escalation={selected} blocked={takenByOther && !isLead}
                note={note} noteError={noteError}
                onNoteChange={(v) => { setNote(v); setNoteError(null); }} onNoteError={setNoteError}
                onClaim={() => claim.mutate(selected.id)} claiming={claim.isPending}
                onResolve={submitResolve} resolving={resolve.isPending} />
            ) : (
              <p className={styles.viewOnly}>View only: team leads and human agents claim and resolve escalations.</p>
            )}
          </>}
        </div>
      </div>
    </div>
  );
}
