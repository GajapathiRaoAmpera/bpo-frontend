"use client";

import { BadgeCheck, ShieldAlert, UserRound } from "lucide-react";

import { Pill } from "@/components/common/pill";
import { SectionCard } from "@/components/common/section-card";
import type { Schemas } from "@/lib/api";
import { formatDate, formatINR } from "@/lib/format";
import { LANGUAGE_LABEL, PRODUCT_LABEL } from "@/lib/labels";

import styles from "./customer-card.module.scss";

type Session = Schemas["SessionOut"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <dt className={styles.eyebrow}>{label}</dt>
      <dd className={styles.fieldValue}>{children}</dd>
    </div>
  );
}

export function CustomerCard({ session, preview }: { session: Session | undefined; preview: Schemas["QueueItem"] | null }) {
  const customer = session?.customer;
  const policy = session?.policy;
  if (!customer && !preview) {
    return (
      <SectionCard size="sm" title="Customer">
        <div className={styles.emptyCustomer}>
          <span className={styles.emptyIcon}>
            <UserRound aria-hidden className={styles.iconLg} />
          </span>
          <p className={styles.muted}>
            {session ? "Caller not identified yet. The AI verifies the policy number and date of birth first." : "Select a renewal or take an inbound call."}
          </p>
        </div>
      </SectionCard>
    );
  }
  const name = customer?.full_name ?? preview!.customer_name;
  const verified = session?.verified;
  return (
    <SectionCard
      size="sm"
      title="Customer"
      action={session ? (verified
        ? <Pill tone="success"><BadgeCheck aria-hidden className={styles.pillIcon} />Verified</Pill>
        : <Pill tone="warning"><ShieldAlert aria-hidden className={styles.pillIcon} />Not yet verified</Pill>) : undefined}
    >
      <div className={styles.identity}>
        <span aria-hidden className={styles.avatar}>
          {name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
        </span>
        <div className={styles.identityText}>
          <span className={styles.name}>{name}</span>
          <span className={styles.location}>
            {customer ? `${customer.city}, ${customer.state}` : preview!.city}
          </span>
        </div>
      </div>
      <dl className={styles.fields}>
        {customer && <Field label="Customer ID">{customer.customer_code}</Field>}
        {customer && <Field label="Mobile">{customer.phone}</Field>}
        <Field label="Language"><Pill tone="lang">{LANGUAGE_LABEL[customer?.preferred_language ?? preview!.preferred_language]}</Pill></Field>
        <Field label="Policy">{policy?.policy_no ?? preview?.policy_no ?? "—"}</Field>
        {(policy || preview) && <Field label="Product">{PRODUCT_LABEL[policy?.product ?? preview!.product]}</Field>}
        {(policy || preview) && <Field label="Premium">{formatINR(policy?.premium_inr ?? preview!.premium_inr)}</Field>}
        {(policy || preview) && <Field label="Renewal due">{formatDate(policy?.renewal_date ?? preview!.renewal_date)}</Field>}
      </dl>
      {session && !verified && (
        <p className={styles.verifyNote}>The AI shares nothing about this policy until identity is verified.</p>
      )}
    </SectionCard>
  );
}
