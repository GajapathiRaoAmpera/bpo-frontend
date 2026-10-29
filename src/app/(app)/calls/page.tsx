import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Call History" };

export default function Page() {
  return <ModulePending screen="calls" />;
}
