import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Customers & Policies" };

export default function Page() {
  return <ModulePending screen="customers" />;
}
