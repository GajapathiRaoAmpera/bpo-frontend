import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { FollowUpsPage } from "@/views/follow-ups/follow-ups-page";

export const metadata: Metadata = { title: "Follow-ups" };

export default function Page() {
  return (
    <ScreenGuard screen="followups">
      <FollowUpsPage />
    </ScreenGuard>
  );
}
