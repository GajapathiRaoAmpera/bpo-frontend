import Link from "next/link";

import { Pill } from "@/components/common/pill";
import { OUTCOME_TONE, SENTIMENT_TONE } from "@/components/ops/tones";
import type { Schemas } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { formatDuration, OUTCOME_LABEL, SENTIMENT_LABEL } from "@/lib/labels";

import styles from "./call-hero.module.scss";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.meta}>
      <span className={styles.metaLabel}>{label}</span>
      <span className={styles.metaValue}>{children}</span>
    </div>
  );
}

export function CallHero({ c, back }: { c: Schemas["CallDetail"]; back: React.ReactNode }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroTop}>
        <div className={styles.heroIntro}>
          <div className={styles.badges}>
            <Pill tone="info">{c.mode === "renewal" ? "Renewal call" : "Inbound query"}</Pill>
            {c.outcome && <Pill tone={OUTCOME_TONE[c.outcome]}>{OUTCOME_LABEL[c.outcome]}</Pill>}
            {c.verified ? <Pill tone="success">Identity verified</Pill> : <Pill tone="warning">Not verified</Pill>}
            {c.is_simulated && <Pill tone="neutral">Seeded sample call</Pill>}
          </div>
          <h1 className={styles.title}>
            {c.customer?.full_name ?? "Unidentified caller"}{c.policy ? ` · ${c.policy.plan_name}` : ""}
          </h1>
          <div className={styles.facts}>
            {c.customer && <span>{c.customer.phone} · {c.customer.city}, {c.customer.state}</span>}
            {c.policy && <span>Policy <span className={styles.policyNo}>{c.policy.policy_no}</span></span>}
            {c.customer && <Link href={`/customers/${c.customer.id}`} className={styles.customerLink}>Open Customer 360</Link>}
          </div>
        </div>
        {back}
      </div>
      <div className={styles.metaGrid}>
        <Meta label="Started">{formatDateTime(c.started_at)}</Meta>
        <Meta label="Duration">{formatDuration(c.duration_sec)}</Meta>
        <Meta label="Handled by">{c.agent_name ? `AI, then ${c.agent_name}` : "AI agent"}</Meta>
        <Meta label="Taken over">{c.taken_over_at ? formatDateTime(c.taken_over_at) : "No"}</Meta>
        <Meta label="Sentiment">{c.sentiment ? <Pill tone={SENTIMENT_TONE[c.sentiment]}>{SENTIMENT_LABEL[c.sentiment]}</Pill> : "—"}</Meta>
      </div>
    </section>
  );
}
