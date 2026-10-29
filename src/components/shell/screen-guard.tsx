"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";
import { NAV } from "@/lib/nav";
import { SCREEN_HREF, type Screen } from "@/lib/routes";

// UX only: shows "No access" for a screen outside the role's menu. The API returns 403 regardless.
export function ScreenGuard({ screen, children }: { screen: Screen; children: React.ReactNode }) {
  const { data: me } = useMe();
  if (!me || me.nav.some((n) => n.screen === screen)) return children;
  return (
    <EmptyState
      icon={Lock}
      title="This area isn't part of your role"
      description={`${NAV[screen].label} is not available to the ${me.role_label} role. Ask your administrator if you need access.`}
      action={
        <Button asChild>
          <Link href={SCREEN_HREF[me.landing]}>Go to {NAV[me.landing].label}</Link>
        </Button>
      }
    />
  );
}
