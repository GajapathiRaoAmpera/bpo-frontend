import type { Metadata } from "next";

import { IntegrationsList } from "@/app/(app)/admin/integrations/integrations-list";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return (
    <ScreenGuard screen="integrations">
      <IntegrationsList />
    </ScreenGuard>
  );
}
