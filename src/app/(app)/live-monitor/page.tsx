import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Live Monitor" };

export default function Page() {
  return <ModulePending screen="live_monitor" />;
}
