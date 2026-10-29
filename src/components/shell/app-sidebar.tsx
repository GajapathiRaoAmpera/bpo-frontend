"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Schemas } from "@/lib/api";
import { GROUP_LABEL, NAV, type NavGroup } from "@/lib/nav";
import { screenForPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

const GROUPS: NavGroup[] = ["operations", "governance", "admin"];
// Display order is a UI decision: NAV order (as in the designs), not the API's order.
const ORDER = Object.keys(NAV);

export function AppSidebar({ nav }: { nav: Schemas["NavItem"][] }) {
  const active = screenForPath(usePathname());
  const byGroup = (g: NavGroup) =>
    nav.filter((n) => NAV[n.screen].group === g).sort((a, b) => ORDER.indexOf(a.screen) - ORDER.indexOf(b.screen));
  const top = GROUPS.slice(0, 2).filter((g) => byGroup(g).length);
  const admin = byGroup("admin");

  return (
    <aside className="fixed top-[5.75rem] bottom-0 left-0 z-30 flex w-60 flex-col justify-between overflow-y-auto bg-surface-container-lowest shadow-chrome">
      <nav aria-label="Main" className="flex flex-col gap-space-lg p-space-md">
        {top.map((g) => (
          <div key={g} className="flex flex-col">
            <span className="px-space-sm pb-space-sm text-label-xs tracking-wider text-outline uppercase">
              {GROUP_LABEL[g]}
            </span>
            <div className="flex flex-col gap-1">
              {byGroup(g).map((n) => (
                <NavLink key={n.screen} screen={n.screen} active={active === n.screen} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {admin.length > 0 && (
        <nav aria-label={GROUP_LABEL.admin} className="flex flex-col gap-0.5 p-space-md">
          {admin.map((n) => (
            <NavLink key={n.screen} screen={n.screen} active={active === n.screen} compact />
          ))}
        </nav>
      )}
    </aside>
  );
}

function NavLink({ screen, active, compact }: { screen: Schemas["Screen"]; active: boolean; compact?: boolean }) {
  const { href, label, icon: Icon } = NAV[screen];
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-space-sm rounded-lg px-space-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border",
        compact ? "py-1.5" : "py-2",
        active
          ? "bg-primary-container text-label-md text-on-primary"
          : "text-body-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
      )}
    >
      <Icon aria-hidden className={compact ? "size-4" : "size-[18px]"} />
      <span>{label}</span>
    </Link>
  );
}
