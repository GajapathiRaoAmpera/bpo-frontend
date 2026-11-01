import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { CampaignsPage } from "@/views/campaigns/campaigns-page";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return (
    <ScreenGuard screen="campaigns">
      <CampaignsPage />
    </ScreenGuard>
  );
}
