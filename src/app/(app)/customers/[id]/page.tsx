import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { CustomerDetailPage } from "@/views/customers/customer-detail-page";

export const metadata: Metadata = { title: "Customer 360" };

export default function Page({ params }: PageProps<"/customers/[id]">) {
  return (
    <ScreenGuard screen="customers">
      <CustomerDetailPage params={params} />
    </ScreenGuard>
  );
}
