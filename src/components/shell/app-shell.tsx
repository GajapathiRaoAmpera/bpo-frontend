"use client";

import { CircleAlert } from "lucide-react";
import { Suspense } from "react";

import { AppHeader } from "@/components/shell/app-header";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";

import styles from "./app-shell.module.scss";

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
      <div className={styles.offset}>
        <main className={styles.main}>
          <div className={styles.content}>
            {error && (
              <div role="alert" className={styles.alert}>
                <span className={styles.alertText}>
                  <CircleAlert aria-hidden className={styles.alertIcon} />
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
    <div className={styles.headerSkeleton}>
      <Skeleton className={styles.brandBone} />
      <Skeleton className={styles.accountBone} />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside aria-busy="true" className={styles.sidebarSkeleton}>
      <Skeleton className={styles.groupBone} />
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className={styles.linkBone} />
      ))}
    </aside>
  );
}
