import type { Metadata } from "next";

import { Dashboard } from "@/app/(app)/dashboard/dashboard";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Executive Dashboard" };

export default function Page() {
  return (
    <ScreenGuard screen="dashboard">
      <Dashboard />
    </ScreenGuard>
  );
}
