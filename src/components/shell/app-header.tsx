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
    <header className="fixed inset-x-0 top-(--banner-h) z-40 h-16 bg-surface-container-lowest/90 shadow-chrome backdrop-blur-md">
      <div className="flex h-16 items-center justify-between gap-space-lg px-gutter-desktop">
        <div className="w-60 shrink-0">
          <Brand />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-space-sm rounded-lg py-1 pr-1.5 pl-space-sm text-left transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border"
            aria-label={`Account menu for ${user.full_name}`}
          >
            <span
              aria-hidden
              className="flex size-8 items-center justify-center rounded-full bg-primary-container text-label-sm text-on-primary"
            >
              {initials(user.full_name)}
            </span>
            <span className="flex flex-col">
              <span className="text-label-md leading-tight text-on-surface">{user.full_name}</span>
              <span className="text-label-xs leading-tight font-medium text-on-surface-variant">
                {user.job_title} · {me.role_label}
              </span>
            </span>
            <ChevronDown aria-hidden className="size-4 text-on-surface-variant" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
              <span className="text-label-md text-on-surface">{user.full_name}</span>
              <span className="text-label-sm text-on-surface-variant">{user.email}</span>
              <span className="mt-1 w-fit rounded-full border border-neutral-border bg-neutral-bg px-2 py-0.5 text-label-xs text-neutral-text">
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
