"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Brand } from "@/components/shell/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api, type Schemas, unwrap } from "@/lib/api";
import { initials } from "@/lib/format";

import styles from "./app-header.module.scss";

export function AppHeader({ me }: { me: Schemas["MeOut"] }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await unwrap(api.POST("/api/v1/auth/logout"));
      queryClient.clear();
      router.replace("/login");
    } catch (e) {
      setSigningOut(false);
      toast.error((e as Error).message);
    }
  }

  const { user } = me;
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brandSlot}>
          <Brand />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={styles.trigger}
            aria-label={`Account menu for ${user.full_name}`}
          >
            <span
              aria-hidden
              className={styles.avatar}
            >
              {initials(user.full_name)}
            </span>
            <span className={styles.who}>
              <span className={styles.name}>{user.full_name}</span>
              <span className={styles.role}>
                {user.job_title} · {me.role_label}
              </span>
            </span>
            <ChevronDown aria-hidden className={styles.chevron} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={styles.menu}>
            <DropdownMenuLabel className={styles.menuLabel}>
              <span className={styles.menuName}>{user.full_name}</span>
              <span className={styles.menuEmail}>{user.email}</span>
              <span className={styles.roleChip}>
                {me.role_label}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut} disabled={signingOut}>
              <LogOut aria-hidden />
              {signingOut ? "Signing out…" : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
