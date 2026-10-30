import type { Metadata } from "next";

import { EscalationQueue } from "@/app/(app)/escalations/escalation-queue";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Escalation Queue" };

export default function Page() {
  return (
    <ScreenGuard screen="escalations">
      <EscalationQueue />
    </ScreenGuard>
  );
}
