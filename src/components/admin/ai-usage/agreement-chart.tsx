"use client";

import { ClipboardCheck } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { C } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { QA_LABEL } from "@/lib/labels";

import styles from "./charts.module.scss";

export function AgreementChart({ usage: u }: { usage: Schemas["AiUsage"] | undefined }) {
  if (u && u.reviewed_calls === 0) {
    return (
      <EmptyState icon={ClipboardCheck} title="No QA reviews yet"
        description="Agreement appears after a QA analyst reviews an AI-scored call." />
    );
  }
  const data = u?.checks.map((c) => ({
    label: QA_LABEL[c.check as keyof typeof QA_LABEL] ?? c.check,
    pct: c.reviewed ? Math.round((100 * c.agreed) / c.reviewed) : 0,
  }));
  return (
    <div className={styles.chart}>
      {!data ? <Skeleton className={styles.chartSkeleton} /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="label" width={120} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "var(--color-surface-container-low)" }} formatter={(v) => [`${String(v)}%`, "Agreement"]} />
            <Bar dataKey="pct" name="Agreement" fill={C.secondary} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
