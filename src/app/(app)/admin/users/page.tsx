import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Users & Roles" };

export default function Page() {
  return <ModulePending screen="users" />;
}
