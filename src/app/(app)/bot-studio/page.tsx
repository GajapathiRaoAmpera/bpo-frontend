import type { Metadata } from "next";

import { ModulePending } from "@/components/common/module-pending";

export const metadata: Metadata = { title: "Bot Studio" };

export default function Page() {
  return <ModulePending screen="bot_studio" />;
}
