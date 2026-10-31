"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Schemas } from "@/lib/api";
import { GROUP_LABEL, NAV, type NavGroup } from "@/lib/nav";
import { screenForPath } from "@/lib/routes";
import { cn } from "@/lib/utils";

import styles from "./app-sidebar.module.scss";

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
    <aside className={styles.sidebar}>
      <nav aria-label="Main" className={styles.main}>
        {top.map((g) => (
          <div key={g} className={styles.group}>
            <span className={styles.groupLabel}>
              {GROUP_LABEL[g]}
            </span>
            <div className={styles.links}>
              {byGroup(g).map((n) => (
                <NavLink key={n.screen} screen={n.screen} active={active === n.screen} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      {admin.length > 0 && (
        <nav aria-label={GROUP_LABEL.admin} className={styles.admin}>
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
        styles.link,
        compact && styles.compact,
        active ? styles.active : styles.idle,
      )}
    >
      <Icon aria-hidden className={compact ? styles.iconCompact : styles.icon} />
      <span>{label}</span>
    </Link>
  );
}
