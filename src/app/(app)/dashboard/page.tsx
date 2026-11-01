import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { DashboardPage } from "@/views/dashboard/dashboard-page";

export const metadata: Metadata = { title: "Executive Dashboard" };

export default function Page() {
  return (
    <ScreenGuard screen="dashboard">
      <DashboardPage />
    </ScreenGuard>
  );
}
