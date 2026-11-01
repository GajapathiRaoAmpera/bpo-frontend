import { ShieldAlert } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { CustomerMeta } from "@/components/customers/customer-meta";
import type { Schemas } from "@/lib/api";
import { formatDate, initials } from "@/lib/format";
import { LANGUAGE_LABEL } from "@/lib/labels";

import styles from "./customer-hero.module.scss";

export function CustomerHero({ c, back }: { c: Schemas["Customer360"]; back: React.ReactNode }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroTop}>
        <div className={styles.identity}>
          <span aria-hidden className={styles.avatar}>{initials(c.full_name)}</span>
          <div className={styles.identityText}>
            <div className={styles.nameRow}>
              <h1 className={styles.title}>{c.full_name}</h1>
              {c.masked && <Pill tone="warning"><ShieldAlert aria-hidden className={styles.badgeIcon} />Masked view</Pill>}
            </div>
            <span className={styles.subtitle}>{c.customer_code} · {c.city}, {c.state}</span>
          </div>
        </div>
        {back}
      </div>
      <dl className={styles.metaGrid}>
        <CustomerMeta label="Mobile">{c.phone}</CustomerMeta>
        <CustomerMeta label="Email">{c.email}</CustomerMeta>
        <CustomerMeta label="Date of birth">{c.dob ? formatDate(c.dob) : "Hidden for your role"}</CustomerMeta>
        <CustomerMeta label="Language"><Pill tone="lang">{LANGUAGE_LABEL[c.preferred_language]}</Pill></CustomerMeta>
      </dl>
    </section>
  );
}
