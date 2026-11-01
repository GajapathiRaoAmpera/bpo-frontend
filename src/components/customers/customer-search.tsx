"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import styles from "./customer-search.module.scss";

export function CustomerSearch({ q, onQ, masked }: { q: string; onQ: (q: string) => void; masked: boolean }) {
  return (
    <div className={styles.searchCard}>
      <Label htmlFor="cust-q" className={styles.searchLabel}>Search customers</Label>
      <div className={styles.searchBox}>
        <Search aria-hidden className={styles.searchIcon} />
        <Input id="cust-q" value={q} onChange={(e) => onQ(e.target.value)} className={styles.searchInput}
          placeholder={masked ? "Name, customer code or policy no." : "Name, mobile, customer code or policy no."} />
      </div>
      {masked && <p className={styles.hint}>Your role sees masked mobile numbers and email, no date of birth, and can&apos;t search by mobile.</p>}
    </div>
  );
}
