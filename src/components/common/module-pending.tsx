import { Hourglass } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { ScreenGuard } from "@/components/shell/screen-guard";
import { NAV } from "@/lib/nav";
import type { Screen } from "@/lib/routes";

// Placeholder for a screen whose build phase hasn't started; says so plainly rather than faking data.
export function ModulePending({ screen }: { screen: Screen }) {
  const meta = NAV[screen];
  return (
    <ScreenGuard screen={screen}>
      <PageHeader title={meta.label} description={meta.description} />
      <EmptyState
        icon={Hourglass}
        title={`${meta.label} is scheduled for Phase ${meta.phase}`}
        description="Your access to this screen is set up. Its data views will appear here once that build phase is delivered."
      />
    </ScreenGuard>
  );
}
