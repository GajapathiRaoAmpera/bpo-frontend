import type { Metadata } from "next";

import { QAReview } from "@/app/(app)/qa/qa-review";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "QA Review" };

export default function Page() {
  return (
    <ScreenGuard screen="qa">
      <QAReview />
    </ScreenGuard>
  );
}
