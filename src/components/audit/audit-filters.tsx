"use client";

import { ACTION_LABEL, SELECT_CLASS } from "@/components/admin/labels";
import type { AuditFilters as Filters } from "@/components/audit/use-audit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schemas } from "@/lib/api";

import styles from "./audit-filters.module.scss";

export function AuditFilters({ draft, onDraftChange, onApply, onReset, filtered }: {
  draft: Filters;
  onDraftChange: (draft: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  filtered: boolean;
}) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onDraftChange({ ...draft, [k]: e.target.value });

  return (
    <form className={styles.filters} onSubmit={(e) => { e.preventDefault(); onApply(); }}>
      <div className={styles.field}>
        <Label htmlFor="f-actor" className={styles.eyebrow}>Actor</Label>
        <Input id="f-actor" value={draft.actor} onChange={set("actor")} placeholder="Name or email" maxLength={80} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="f-action" className={styles.eyebrow}>Action</Label>
        <select id="f-action" className={SELECT_CLASS} value={draft.action} onChange={set("action")}>
          <option value="">All actions</option>
          {(Object.keys(ACTION_LABEL) as Schemas["AuditAction"][]).map((a) => <option key={a} value={a}>{ACTION_LABEL[a]}</option>)}
        </select>
      </div>
      <div className={styles.field}>
        <Label htmlFor="f-entity" className={styles.eyebrow}>Entity</Label>
        <Input id="f-entity" value={draft.entity_type} onChange={set("entity_type")} placeholder="e.g. customer" maxLength={40} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="f-from" className={styles.eyebrow}>From (IST)</Label>
        <Input id="f-from" type="date" value={draft.date_from} onChange={set("date_from")} />
      </div>
      <div className={styles.field}>
        <Label htmlFor="f-to" className={styles.eyebrow}>To (IST)</Label>
        <Input id="f-to" type="date" value={draft.date_to} min={draft.date_from || undefined} onChange={set("date_to")} />
      </div>
      <div className={styles.filterActions}>
        <Button type="button" variant="outline" onClick={onReset} disabled={!filtered}>Reset filters</Button>
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
