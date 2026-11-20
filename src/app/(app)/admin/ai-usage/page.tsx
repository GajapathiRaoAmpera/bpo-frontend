import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { AiUsagePage } from "@/views/admin/ai-usage-page";

export const metadata: Metadata = { title: "AI Usage & Quality" };

export default function Page() {
  return (
    <ScreenGuard screen="ai_usage">
      <AiUsagePage />
    </ScreenGuard>
  );
}
