"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Schemas } from "@/lib/api";
import { OUTCOME_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";

import styles from "./calls-filters.module.scss";

const OUTCOMES = Object.keys(OUTCOME_LABEL) as Schemas["CallOutcome"][];

export function CallsFilters({ q, onQ, outcome, onOutcome }: {
  q: string;
  onQ: (q: string) => void;
  outcome: Schemas["CallOutcome"] | null;
  onOutcome: (o: Schemas["CallOutcome"] | null) => void;
}) {
  return (
    <div className={styles.filters}>
      <div className={styles.search}>
        <Label htmlFor="calls-q" className={styles.searchLabel}>Search calls</Label>
        <div className={styles.searchBox}>
          <Search aria-hidden className={styles.searchIcon} />
          <Input id="calls-q" value={q} onChange={(e) => onQ(e.target.value)} className={styles.searchInput} placeholder="CALL-20261029-0001, name or policy no." />
        </div>
      </div>
      <div role="group" aria-label="Filter by outcome" className={styles.outcomes}>
        {[null, ...OUTCOMES].map((o) => (
          <button key={o ?? "all"} type="button" aria-pressed={outcome === o} onClick={() => onOutcome(o)}
            className={cn(styles.outcome, outcome === o && styles.outcomeActive)}>
            {o ? OUTCOME_LABEL[o] : "All outcomes"}
          </button>
        ))}
      </div>
    </div>
  );
}
