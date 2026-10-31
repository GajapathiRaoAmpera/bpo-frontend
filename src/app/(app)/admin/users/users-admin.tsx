"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, RotateCcw, ShieldCheck, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { UserDialog } from "@/app/(app)/admin/users/user-dialog";
import { LEVEL_LABEL, ROLE_LABEL, TD, TH } from "@/components/admin/labels";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pill, type PillTone } from "@/components/common/pill";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/use-me";
import { api, type Schemas, unwrap } from "@/lib/api";
import { formatDateTime, initials } from "@/lib/format";
import { NAV } from "@/lib/nav";
import { IS_SANDBOX } from "@/lib/personas";

import styles from "./users-admin.module.scss";

type User = Schemas["UserAdminRow"];
const LEVEL_TONE: Record<Schemas["Level"], PillTone> = { full: "success", view: "info", approve: "warning", masked: "lang", own: "neutral" };

function ErrorBox({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className={styles.error}>
      {message}
      <Button size="sm" variant="outline" onClick={retry}>Try again</Button>
    </div>
  );
}

function PermissionMatrix() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["rbac", "matrix"],
    queryFn: () => unwrap(api.GET("/api/v1/rbac/matrix")),
    staleTime: Infinity,
  });
  return (
    <section aria-labelledby="matrix-heading" className={styles.card}>
      <div className={styles.intro}>
        <h2 id="matrix-heading" className={`${styles.heading} ${styles.iconHeading}`}>
          <ShieldCheck aria-hidden className={styles.headingIcon} /> Permission matrix
        </h2>
        <p className={styles.lede}>Read from the API&apos;s single access matrix, which every endpoint enforces. Role access is fixed{IS_SANDBOX && " in this sandbox"}.</p>
      </div>
      {error && <ErrorBox message={error.message} retry={() => refetch()} />}
      {isLoading && <Skeleton className={styles.loading} />}
      {data && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={TH}>Screen</th>
                {data.roles.map((r) => <th key={r.role} className={TH}>{r.label}</th>)}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {data.screens.map((s) => (
                <tr key={s} className={styles.matrixRow}>
                  <th scope="row" className={`${TD} ${styles.screenName}`}>{NAV[s].label}</th>
                  {data.roles.map((r) => {
                    const level = data.matrix[s]?.[r.role];
                    return (
                      <td key={r.role} className={TD}>
                        {level ? <Pill tone={LEVEL_TONE[level]}>{LEVEL_LABEL[level]}</Pill> : <span className={styles.noAccess} aria-label="No access">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function UsersAdmin() {
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => unwrap(api.GET("/api/v1/users")),
  });

  const setActive = useMutation({
    mutationFn: ({ user, active }: { user: User; active: boolean }) => active
      ? unwrap(api.PATCH("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } }, body: { is_active: true } }))
      : unwrap(api.DELETE("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } } })),
    onSuccess: (u) => {
      toast.success(u.is_active ? `${u.full_name} can sign in again` : `${u.full_name} is deactivated and signed out`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Users & Roles"
        description="Staff accounts and their roles. Accounts are deactivated, never deleted, so the audit trail stays intact. Every change is audited."
        actions={<Button onClick={() => setCreating(true)}><UserPlus aria-hidden /> Add user</Button>}
      />

      <section aria-labelledby="users-heading" className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 id="users-heading" className={styles.heading}>Users</h2>
          {data && <Pill tone="info">{data.filter((u) => u.is_active).length} active · {data.length} total</Pill>}
        </div>
        {error && <ErrorBox message={error.message} retry={() => refetch()} />}
        {data?.length === 0 ? (
          <EmptyState icon={Users} title="No users yet" description="Add the first staff account to get started."
            action={<Button onClick={() => setCreating(true)}><UserPlus aria-hidden /> Add user</Button>} />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr><th className={TH}>Name</th><th className={TH}>Job title</th><th className={TH}>Role</th><th className={TH}>Status</th><th className={TH}>Last sign-in</th><th className={`${TH} ${styles.right}`}>Actions</th></tr>
              </thead>
              <tbody className={styles.tbody}>
                {isLoading && Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={6} className={TD}><Skeleton className={styles.skeletonRow} /></td></tr>)}
                {data?.map((u) => {
                  const self = u.id === me?.user.id;
                  return (
                    <tr key={u.id} className={styles.userRow}>
                      <td className={TD}>
                        <div className={styles.person}>
                          <span aria-hidden className={styles.avatar}>{initials(u.full_name)}</span>
                          <span className={styles.personText}>
                            <span className={styles.name}>{u.full_name}{self && <span className={styles.you}> (you)</span>}</span>
                            <span className={styles.email}>{u.email}</span>
                          </span>
                        </div>
                      </td>
                      <td className={`${TD} ${styles.jobTitle}`}>{u.job_title}</td>
                      <td className={TD}><Pill tone="info">{ROLE_LABEL[u.role]}</Pill></td>
                      <td className={TD}>{u.is_active ? <Pill tone="success">Active</Pill> : <Pill tone="neutral">Deactivated</Pill>}</td>
                      <td className={`${TD} ${styles.lastLogin}`}>{u.last_login_at ? formatDateTime(u.last_login_at) : "Never"}</td>
                      <td className={`${TD} ${styles.actions}`}>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(u)} aria-label={`Edit ${u.full_name}`}><Pencil aria-hidden /> Edit</Button>
                        {u.is_active ? (
                          <Button size="sm" variant="ghost" className={styles.danger} disabled={self} title={self ? "You can't deactivate your own account" : undefined}
                            onClick={() => setDeactivating(u)} aria-label={`Deactivate ${u.full_name}`}><UserMinus aria-hidden /> Deactivate</Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled={setActive.isPending}
                            onClick={() => setActive.mutate({ user: u, active: true })} aria-label={`Reactivate ${u.full_name}`}><RotateCcw aria-hidden /> Reactivate</Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PermissionMatrix />

      <UserDialog open={creating || editing !== null} user={editing ?? undefined} isSelf={editing?.id === me?.user.id}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }} />

      <AlertDialog open={deactivating !== null} onOpenChange={(o) => { if (!o) setDeactivating(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {deactivating?.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They are signed out at once and can&apos;t sign in until reactivated. Their history and audit entries are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep active</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => deactivating && setActive.mutate({ user: deactivating, active: false })}>
              Deactivate {deactivating?.full_name.split(" ")[0]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
