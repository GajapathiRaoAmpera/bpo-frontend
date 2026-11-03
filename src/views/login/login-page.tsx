import { ShieldCheck } from "lucide-react";
import { Suspense } from "react";

import { BrandScene } from "@/components/auth/brand-scene";
import { LoginForm } from "@/components/auth/login-form";
import { Brand } from "@/components/shell/brand";
import { Skeleton } from "@/components/ui/skeleton";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./login-page.module.scss";

export function LoginPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.aside}>
        <BrandScene />
        <Brand inverted />
        {/* kept empty in production so justify-between keeps the logo pinned to the top */}
        <p className={styles.footnote}>{IS_SANDBOX && "Sandbox edition · all customer data is synthetic"}</p>
      </aside>

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span aria-hidden className={styles.badge}>
              <ShieldCheck className={styles.badgeIcon} />
            </span>
            <h2 className={styles.cardTitle}>Sign in</h2>
            <p className={styles.cardText}>Use your Ampera BPO work account.</p>
          </div>
          <Suspense fallback={<Skeleton className={styles.formSkeleton} />}>
            <LoginForm />
          </Suspense>
        </div>
        <ul className={styles.trust}>
          <li>Secure session</li>
          <li>Role-based access</li>
          <li>Every sign-in audited</li>
        </ul>
      </main>
    </div>
  );
}
