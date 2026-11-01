import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { LiveMonitorPage } from "@/views/live-monitor/live-monitor-page";

export const metadata: Metadata = { title: "Live Monitor" };

export default function Page() {
  return (
    <ScreenGuard screen="live_monitor">
      <LiveMonitorPage />
    </ScreenGuard>
  );
}
