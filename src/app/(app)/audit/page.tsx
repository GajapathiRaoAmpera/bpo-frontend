import type { Metadata } from "next";

import { AuditLog } from "@/app/(app)/audit/audit-log";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Audit Log" };

export default function Page() {
  return (
    <ScreenGuard screen="audit">
      <AuditLog />
    </ScreenGuard>
  );
}
