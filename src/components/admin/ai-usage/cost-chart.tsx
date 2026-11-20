"use client";

import { Gauge } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ChartTip } from "@/components/dashboard/chart-tip";
import { C, n, shortDay } from "@/components/dashboard/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Schemas } from "@/lib/api";

import styles from "./charts.module.scss";

// Rates are fractions of a rupee, so formatINR (whole rupees) would print ₹0 or ₹1.
const rate = (v: number) => v.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 });

export function CostChart({ usage: u }: { usage: Schemas["AiUsage"] | undefined }) {
  if (u && u.voice_minutes + u.analyses + u.messages === 0) {
    return (
      <EmptyState icon={Gauge} title="No live AI calls in this period"
        description="Cost appears once the voice agent handles real calls. Simulated campaign calls don't use Gemini." />
    );
  }
  return (
    <>
      <div className={styles.chart}>
        {!u ? <Skeleton className={styles.chartSkeleton} /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={u.trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={C.grid} />
              <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis tick={{ fill: C.text, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "var(--color-surface-container-low)" }} content={<ChartTip money />} />
              <Bar dataKey="voice_inr" name="Voice agent" stackId="c" fill={C.primary} />
              <Bar dataKey="analysis_inr" name="Call analysis" stackId="c" fill={C.secondary} />
              <Bar dataKey="message_inr" name="Follow-up messages" stackId="c" fill="var(--color-outline-variant)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {u && (
        <p className={styles.footnote}>
          Estimated: {n(u.voice_minutes)} AI min × {rate(u.rates.live_inr_per_min)}/min + {n(u.analyses)} analyses
          × {rate(u.rates.flash_inr_per_analysis)} + {n(u.messages)} messages × {rate(u.rates.flash_inr_per_message)}.
        </p>
      )}
    </>
  );
}
