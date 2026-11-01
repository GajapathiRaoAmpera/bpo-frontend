import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { ApprovalsPage } from "@/views/approvals/approvals-page";

export const metadata: Metadata = { title: "Approvals" };

export default function Page() {
  return (
    <ScreenGuard screen="approvals">
      <ApprovalsPage />
    </ScreenGuard>
  );
}
