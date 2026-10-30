import type { Metadata } from "next";

import { CallsTable } from "@/app/(app)/calls/calls-table";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Call History" };

export default function Page() {
  return (
    <ScreenGuard screen="calls">
      <CallsTable />
    </ScreenGuard>
  );
}
