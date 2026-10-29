import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Audit Log" };

export default function Page() {
  return <ModulePending screen="audit" />;
}
