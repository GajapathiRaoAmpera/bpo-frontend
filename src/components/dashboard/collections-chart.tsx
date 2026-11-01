"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartTip } from "@/components/dashboard/chart-tip";
import { C, shortDay } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";
import { formatINR } from "@/lib/format";

import styles from "./collections-chart.module.scss";

// Axis ticks only: ₹ lakh shorthand keeps the axis narrow; tooltips show the exact amount.
const lakh = (v: number) => (v >= 1_00_000 ? `₹${(v / 1_00_000).toFixed(1)}L` : formatINR(v));

export function CollectionsChart({ trends: t }: { trends: Schemas["TrendPoint"][] | undefined }) {
  return (
    <div className={styles.collectionsChart}>
      {!t ? <Skeleton className={styles.chartSkeleton} /> : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={t} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={C.grid} />
            <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
            <YAxis tickFormatter={lakh} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTip money />} />
            <Area type="monotone" dataKey="collections_inr" name="Collected" stroke={C.secondary} fill={C.secondary} fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
