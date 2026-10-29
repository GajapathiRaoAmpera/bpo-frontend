import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Agent Console" };

export default function Page() {
  return <ModulePending screen="agent_console" />;
}
