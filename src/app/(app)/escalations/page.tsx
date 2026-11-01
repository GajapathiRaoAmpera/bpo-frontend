import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { EscalationsPage } from "@/views/escalations/escalations-page";

export const metadata: Metadata = { title: "Escalation Queue" };

export default function Page() {
  return (
    <ScreenGuard screen="escalations">
      <EscalationsPage />
    </ScreenGuard>
  );
}
