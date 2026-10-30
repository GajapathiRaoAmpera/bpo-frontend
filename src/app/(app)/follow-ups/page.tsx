import type { Metadata } from "next";

import { Followups } from "@/app/(app)/follow-ups/followups";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Follow-ups" };

export default function Page() {
  return (
    <ScreenGuard screen="followups">
      <Followups />
    </ScreenGuard>
  );
}
