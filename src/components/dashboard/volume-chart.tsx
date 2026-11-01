"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTip } from "@/components/dashboard/chart-tip";
import { C, shortDay } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";

import styles from "./volume-chart.module.scss";

export function VolumeChart({ trends: t }: { trends: Schemas["TrendPoint"][] | undefined }) {
  return (
    <div className={styles.volumeChart}>
      {!t ? <Skeleton className={styles.chartSkeleton} /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={t} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis allowDecimals={false} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "var(--color-surface-container-low)" }} content={<ChartTip />} />
            <Bar dataKey="calls" name="Calls" fill={C.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
