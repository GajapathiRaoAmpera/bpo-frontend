import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { IntegrationsPage } from "@/views/admin/integrations-page";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return (
    <ScreenGuard screen="integrations">
      <IntegrationsPage />
    </ScreenGuard>
  );
}
