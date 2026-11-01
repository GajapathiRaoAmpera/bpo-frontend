import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { QAPage } from "@/views/qa/qa-page";

export const metadata: Metadata = { title: "QA Review" };

export default function Page() {
  return (
    <ScreenGuard screen="qa">
      <QAPage />
    </ScreenGuard>
  );
}
