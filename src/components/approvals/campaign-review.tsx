"use client";

import { ShieldCheck } from "lucide-react";

import { Decision } from "@/components/approvals/decision";
import { useDecide } from "@/components/approvals/use-approvals";
import { Pill } from "@/components/common/pill";
import { Panel } from "@/components/maker-checker/shared";
import type { Schemas } from "@/lib/api";
import { formatDate, formatDateTime } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./campaign-review.module.scss";

export function CampaignReview({ campaign: c, checks }: { campaign: Schemas["CampaignOut"]; checks: string[] }) {
  const decide = useDecide("campaign", c.id, c.name);
  const seg = c.segment as { renewal_within_days?: number; languages?: Schemas["Language"][] };
  const rows: [string, React.ReactNode][] = [
    ["Line of business", PRODUCT_LABEL[c.product]],
    ["Audience", `${c.total_targets.toLocaleString("en-IN")} policies renewing within ${seg.renewal_within_days ?? 30} days`],
    ["Languages", (seg.languages ?? []).map((l) => LANGUAGE_LABEL[l]).join(", ")],
    ["Voice AI script", c.script ? `${c.script.name} · v${c.script.version}` : "—"],
    ["Start", c.scheduled_at ? `${formatDate(c.scheduled_at)}, 09:00 IST` : "As soon as approved"],
    ["Calling window", "09:00–19:00 IST"],
    ["Maker", `${c.created_by_name}${c.submitted_at ? `, submitted ${formatDateTime(c.submitted_at)}` : ""}`],
  ];
  return (
    <>
      <Panel className={styles.main} title={c.name} action={<Pill tone="warning"><ShieldCheck aria-hidden className={styles.pillIcon} />Awaiting approval</Pill>}>
        <dl className={styles.summary}>
          {rows.map(([k, v]) => (
            <div key={k} className={styles.summaryRow}>
              <dt className={styles.summaryKey}>{k}</dt>
              <dd className={styles.summaryValue}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.caption}>Once approved, the maker can launch it.{IS_SANDBOX && " Sandbox launches place 3 simulated AI calls at a time."}</p>
      </Panel>
      <div className={styles.side}>
        <Decision name={c.name} checks={checks} onDecide={(approve, body) => decide.mutateAsync({ approve, body })} />
      </div>
    </>
  );
}
