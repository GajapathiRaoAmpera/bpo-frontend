"use client";

import { ShieldCheck } from "lucide-react";

import { LEVEL_LABEL, TD, TH } from "@/components/admin/labels";
import { useRbacMatrix } from "@/components/admin/users/use-users";
import { ErrorAlert } from "@/components/common/error-alert";
import { Pill, type PillTone } from "@/components/common/pill";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { NAV } from "@/lib/nav";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./permission-matrix.module.scss";

const LEVEL_TONE: Record<Schemas["Level"], PillTone> = { full: "success", view: "info", approve: "warning", masked: "lang", own: "neutral" };

export function PermissionMatrix() {
  const { data, isLoading, error, refetch } = useRbacMatrix();
  return (
    <section aria-labelledby="matrix-heading" className={styles.card}>
      <div className={styles.intro}>
        <h2 id="matrix-heading" className={styles.heading}>
          <ShieldCheck aria-hidden className={styles.headingIcon} /> Permission matrix
        </h2>
        <p className={styles.lede}>Read from the API&apos;s single access matrix, which every endpoint enforces. Role access is fixed{IS_SANDBOX && " in this sandbox"}.</p>
      </div>
      {error && <ErrorAlert layout="stacked" onRetry={() => refetch()}>{error.message}</ErrorAlert>}
      {isLoading && <Skeleton className={styles.loading} />}
      {data && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={TH}>Screen</th>
                {data.roles.map((r) => <th key={r.role} className={TH}>{r.label}</th>)}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.screens.map((s) => (
                <tr key={s} className={styles.matrixRow}>
                  <th scope="row" className={`${TD} ${styles.screenName}`}>{NAV[s].label}</th>
                  {data.roles.map((r) => {
                    const level = data.matrix[s]?.[r.role];
                    return (
                      <td key={r.role} className={TD}>
                        {level ? <Pill tone={LEVEL_TONE[level]}>{LEVEL_LABEL[level]}</Pill> : <span className={styles.noAccess} aria-label="No access">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
