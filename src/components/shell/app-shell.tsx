"use client";

import { CircleAlert } from "lucide-react";
import { Suspense } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";

// {children} always renders (Cache Components guidance: never hold a segment behind the session read).
// Persona-dependent chrome fills in when /auth/me resolves; per-screen access is ScreenGuard's job.
export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: me, error, refetch, isFetching } = useMe();

  return (
    <>
      {me ? <AppHeader me={me} /> : <HeaderSkeleton />}
      {me ? (
        <Suspense fallback={<SidebarSkeleton />}>
          <AppSidebar nav={me.nav} />
        </Suspense>
      ) : (
        <SidebarSkeleton />
      )}
      <div className="pl-60">
        <main className="min-h-screen px-gutter-desktop pt-[5.75rem]">
          <div className="flex flex-col gap-space-lg py-space-lg pb-10">
            {error && (
              <div role="alert" className="flex items-center justify-between gap-space-md rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
                <span className="flex items-center gap-space-sm">
                  <CircleAlert aria-hidden className="size-4" />
                  We couldn&apos;t load your workspace. {error.message}
                </span>
                <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
                  Try again
                </Button>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </>
  );
}

function HeaderSkeleton() {
  return (
    <div className="fixed inset-x-0 top-7 z-40 flex h-16 items-center justify-between bg-surface-container-lowest px-gutter-desktop shadow-chrome">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-8 w-52" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside aria-busy="true" className="fixed top-[5.75rem] bottom-0 left-0 flex w-60 flex-col gap-2 bg-surface-container-lowest p-space-md shadow-chrome">
      <Skeleton className="mb-2 h-3 w-28" />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </aside>
  );
}
