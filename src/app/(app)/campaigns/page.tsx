import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Campaigns" };

export default function Page() {
  return <ModulePending screen="campaigns" />;
}
