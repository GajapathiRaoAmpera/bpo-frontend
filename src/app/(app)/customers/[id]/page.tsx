import type { Metadata } from "next";
import { Suspense } from "react";

import { CustomerDetail } from "@/app/(app)/customers/[id]/customer-detail";
import { ScreenGuard } from "@/components/shell/screen-guard";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./page.module.scss";

export const metadata: Metadata = { title: "Customer 360" };

export default function Page({ params }: PageProps<"/customers/[id]">) {
  return (
    <ScreenGuard screen="customers">
      <Suspense fallback={<Skeleton className={styles.fallback} />}>
        <CustomerDetail params={params} />
      </Suspense>
    </ScreenGuard>
  );
}
