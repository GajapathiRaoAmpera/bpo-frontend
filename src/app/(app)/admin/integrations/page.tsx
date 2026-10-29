import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Integrations" };

export default function Page() {
  return <ModulePending screen="integrations" />;
}
