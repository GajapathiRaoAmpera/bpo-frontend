import type { Metadata } from "next";

import { Campaigns } from "@/app/(app)/campaigns/campaigns";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return (
    <ScreenGuard screen="campaigns">
      <Campaigns />
    </ScreenGuard>
  );
}
