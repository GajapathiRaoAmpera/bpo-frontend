import type { Metadata } from "next";

import { CustomersTable } from "@/app/(app)/customers/customers-table";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Customers & Policies" };

export default function Page() {
  return (
    <ScreenGuard screen="customers">
      <CustomersTable />
    </ScreenGuard>
  );
}
