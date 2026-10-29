import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Escalation Queue" };

export default function Page() {
  return <ModulePending screen="escalations" />;
}
