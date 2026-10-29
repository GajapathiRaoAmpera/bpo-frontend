import type { Metadata } from "next";

import { AgentConsole } from "@/app/(app)/agent-console/agent-console";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Agent Console" };

export default function Page() {
  return (
    <ScreenGuard screen="agent_console">
      <AgentConsole />
    </ScreenGuard>
  );
}
