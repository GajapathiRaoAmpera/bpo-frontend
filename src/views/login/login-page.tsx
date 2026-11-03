import { Headset, Languages, ShieldCheck } from "lucide-react";
import { Suspense } from "react";

import { BrandScene } from "@/components/auth/brand-scene";
import { LoginForm } from "@/components/auth/login-form";
import { Brand } from "@/components/shell/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./login-page.module.scss";

const POINTS = [
  { icon: ShieldCheck, title: "Compliant on every call",
    text: "AI disclosure, identity verification and figures straight from policy records, with a QA score for each call." },
  { icon: Headset, title: "People stay in control",
    text: "One-click takeover, an escalation queue, and maker-checker approval for every script and campaign." },
  { icon: Languages, title: "Built for Indian insurance",
    text: "Motor, health and term renewals in English, Tamil and Hindi, with INR and IST throughout." },
];

export function LoginPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <BrandScene />
        <Brand inverted />
        <div className={styles.pitch}>
          <h1 className={styles.headline}>
            AI contact centre for renewals, reminders and policy service
          </h1>
          <ul className={styles.points}>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className={styles.point}>
                <span className={styles.pointIcon}>
                  <Icon aria-hidden className={styles.icon} />
                </span>
                <span className={styles.pointBody}>
                  <span className={styles.pointTitle}>{title}</span>
                  <span className={styles.pointText}>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        {/* kept empty in production so justify-between keeps the headline centred */}
        <p className={styles.footnote}>{IS_SANDBOX && "Sandbox edition · all customer data is synthetic"}</p>
      </aside>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Sign in</h2>
            <p className={styles.cardText}>Use your Ampera BPO work account.</p>
          </div>
          <Suspense fallback={<Skeleton className={styles.formSkeleton} />}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
