import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { AgentConsolePage } from "@/views/agent-console/agent-console-page";

export const metadata: Metadata = { title: "Agent Console" };

export default function Page() {
  return (
    <ScreenGuard screen="agent_console">
      <AgentConsolePage />
    </ScreenGuard>
  );
}
