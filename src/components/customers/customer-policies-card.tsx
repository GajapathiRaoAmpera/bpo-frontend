import { CalendarPlus } from "lucide-react";

import { Pill, type PillTone } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import { CustomerMeta } from "@/components/customers/customer-meta";
import { FollowupDialog } from "@/components/ops/followup-dialog";
import { Button } from "@/components/ui/button";
import type { Schemas } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { PRODUCT_LABEL } from "@/lib/labels";

import styles from "./customer-policies-card.module.scss";

const POLICY_TONE: Record<Schemas["PolicyStatus"], PillTone> = { active: "success", due: "warning", lapsed: "danger", renewed: "info" };
const POLICY_LABEL: Record<Schemas["PolicyStatus"], string> = { active: "Active", due: "Renewal due", lapsed: "Lapsed", renewed: "Renewed" };

export function CustomerPoliciesCard({ policies, canFollowUp }: { policies: Schemas["Customer360"]["policies"]; canFollowUp: boolean }) {
  return (
    <SectionCard title="Policies" action={<Pill tone="info">{policies.length}</Pill>}>
      <div className={styles.policies}>
        {policies.map((p) => (
          <div key={p.id} className={styles.policy}>
            <div className={styles.policyHead}>
              <div className={styles.stack}>
                <span className={styles.planName}>{p.plan_name}</span>
                <span className={styles.policyNo}>{p.policy_no}</span>
              </div>
              <Pill tone={POLICY_TONE[p.status]}>{POLICY_LABEL[p.status]}</Pill>
            </div>
            <dl className={styles.policyMeta}>
              <CustomerMeta label="Product">{PRODUCT_LABEL[p.product]}</CustomerMeta>
              <CustomerMeta label="Premium">{formatINR(p.premium_inr)}</CustomerMeta>
              <CustomerMeta label="Sum insured">{formatINR(p.sum_insured_inr)}</CustomerMeta>
              <CustomerMeta label="Renewal">{formatDate(p.renewal_date)}</CustomerMeta>
              {p.vehicle_reg && <CustomerMeta label="Vehicle">{p.vehicle_reg}</CustomerMeta>}
            </dl>
            {canFollowUp && (
              <FollowupDialog policyNo={p.policy_no} policyId={p.id}
                trigger={<Button size="sm" variant="outline" className={styles.followupButton}><CalendarPlus aria-hidden />Schedule follow-up</Button>} />
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
