import type { Metadata } from "next";

import { LiveMonitor } from "@/app/(app)/live-monitor/live-monitor";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Live Monitor" };

export default function Page() {
  return (
    <ScreenGuard screen="live_monitor">
      <LiveMonitor />
    </ScreenGuard>
  );
}
