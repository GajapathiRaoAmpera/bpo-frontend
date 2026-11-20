"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTip } from "@/components/dashboard/chart-tip";
import { C, shortDay } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";

import styles from "./charts.module.scss";

export function QualityChart({ usage: u }: { usage: Schemas["AiUsage"] | undefined }) {
  return (
    <div className={styles.chart}>
      {!u ? <Skeleton className={styles.chartSkeleton} /> : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={u.trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTip percent />} />
            <Line dataKey="contained_pct" name="AI containment" stroke={C.primary} strokeWidth={2} dot={false} />
            <Line dataKey="escalated_pct" name="Escalated" stroke="var(--color-error)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
