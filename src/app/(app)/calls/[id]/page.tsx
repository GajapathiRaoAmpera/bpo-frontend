import type { Metadata } from "next";
import { Suspense } from "react";

import { CallDetail } from "@/app/(app)/calls/[id]/call-detail";
import { ScreenGuard } from "@/components/shell/screen-guard";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Call detail" };

export default function Page({ params }: PageProps<"/calls/[id]">) {
  return (
    <ScreenGuard screen="calls">
      <Suspense fallback={<Skeleton className={styles.fallback} />}>
        <CallDetail params={params} />
      </Suspense>
    </ScreenGuard>
  );
}
