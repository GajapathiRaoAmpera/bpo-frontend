import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { AuditPage } from "@/views/audit/audit-page";

export const metadata: Metadata = { title: "Audit Log" };

export default function Page() {
  return (
    <ScreenGuard screen="audit">
      <AuditPage />
    </ScreenGuard>
  );
}
