import { SectionCard } from "@/components/common/section-card";
import type { Schemas } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { PRODUCT_LABEL } from "@/lib/labels";

import styles from "./call-policy-card.module.scss";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.fieldLabel}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

export function CallPolicyCard({ policy }: { policy: NonNullable<Schemas["CallDetail"]["policy"]> }) {
  return (
    <SectionCard title="Policy">
      <dl className={styles.fields}>
        <Field label="Policy no.">{policy.policy_no}</Field>
        <Field label="Product">{PRODUCT_LABEL[policy.product]}</Field>
        <Field label="Premium">{formatINR(policy.premium_inr)}</Field>
        <Field label="Sum insured">{formatINR(policy.sum_insured_inr)}</Field>
        <Field label="Renewal due">{formatDate(policy.renewal_date)}</Field>
      </dl>
    </SectionCard>
  );
}
