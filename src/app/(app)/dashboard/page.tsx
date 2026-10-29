import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Executive Dashboard" };

export default function Page() {
  return <ModulePending screen="dashboard" />;
}
