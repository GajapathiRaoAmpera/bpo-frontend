import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { CallDetailPage } from "@/views/calls/call-detail-page";

export const metadata: Metadata = { title: "Call detail" };

export default function Page({ params }: PageProps<"/calls/[id]">) {
  return (
    <ScreenGuard screen="calls">
      <CallDetailPage params={params} />
    </ScreenGuard>
  );
}
