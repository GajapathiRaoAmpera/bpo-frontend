import type { Metadata } from "next";

import { Approvals } from "@/app/(app)/approvals/approvals";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return (
    <ScreenGuard screen="approvals">
      <Approvals />
    </ScreenGuard>
  );
}
