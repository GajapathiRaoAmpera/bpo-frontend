import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { CustomersPage } from "@/views/customers/customers-page";

export const metadata: Metadata = { title: "Customers & Policies" };

export default function Page() {
  return (
    <ScreenGuard screen="customers">
      <CustomersPage />
    </ScreenGuard>
  );
}
