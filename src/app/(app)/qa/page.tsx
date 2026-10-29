import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "QA Review" };

export default function Page() {
  return <ModulePending screen="qa" />;
}
