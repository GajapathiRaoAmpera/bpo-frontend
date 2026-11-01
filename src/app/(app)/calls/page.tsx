import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { CallsPage } from "@/views/calls/calls-page";

export const metadata: Metadata = { title: "Call History" };

export default function Page() {
  return (
    <ScreenGuard screen="calls">
      <CallsPage />
    </ScreenGuard>
  );
}
