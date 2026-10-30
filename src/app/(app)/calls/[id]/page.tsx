import type { Metadata } from "next";
import { Suspense } from "react";

import { CallDetail } from "@/app/(app)/calls/[id]/call-detail";
import { ScreenGuard } from "@/components/shell/screen-guard";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Call detail" };

export default function Page({ params }: PageProps<"/calls/[id]">) {
  return (
    <ScreenGuard screen="calls">
      <Suspense fallback={<Skeleton className="h-40 rounded-lg bg-surface-container-lowest" />}>
        <CallDetail params={params} />
      </Suspense>
    </ScreenGuard>
  );
}
