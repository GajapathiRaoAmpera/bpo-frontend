"use client";

import { Pencil, RotateCcw, UserMinus, UserPlus, Users } from "lucide-react";

import { ROLE_LABEL, TD, TH } from "@/components/admin/labels";
import type { User } from "@/components/admin/users/use-users";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorAlert } from "@/components/common/error-alert";
import { Pill } from "@/components/common/pill";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, initials } from "@/lib/format";

import styles from "./users-table.module.scss";

export function UsersTable({ users, isLoading, error, onRetry, meId, onAdd, onEdit, onDeactivate, onReactivate, reactivating }: {
  users: User[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  meId: number | undefined;
  onAdd: () => void;
  onEdit: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  reactivating: boolean;
}) {
  return (
    <section aria-labelledby="users-heading" className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 id="users-heading" className={styles.heading}>Users</h2>
        {users && <Pill tone="info">{users.filter((u) => u.is_active).length} active · {users.length} total</Pill>}
      </div>
      {error && <ErrorAlert layout="stacked" onRetry={onRetry}>{error.message}</ErrorAlert>}
      {users?.length === 0 ? (
        <EmptyState icon={Users} title="No users yet" description="Add the first staff account to get started."
          action={<Button onClick={onAdd}><UserPlus aria-hidden /> Add user</Button>} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr><th className={TH}>Name</th><th className={TH}>Job title</th><th className={TH}>Role</th><th className={TH}>Status</th><th className={TH}>Last sign-in</th><th className={`${TH} ${styles.right}`}>Actions</th></tr>
            </thead>
            <tbody className={styles.tbody}>
              {isLoading && Array.from({ length: 6 }, (_, i) => <tr key={i}><td colSpan={6} className={TD}><Skeleton className={styles.skeletonRow} /></td></tr>)}
              {users?.map((u) => {
                const self = u.id === meId;
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
                      <Button size="sm" variant="ghost" onClick={() => onEdit(u)} aria-label={`Edit ${u.full_name}`}><Pencil aria-hidden /> Edit</Button>
                      {u.is_active ? (
                        <Button size="sm" variant="ghost" className={styles.danger} disabled={self} title={self ? "You can't deactivate your own account" : undefined}
                          onClick={() => onDeactivate(u)} aria-label={`Deactivate ${u.full_name}`}><UserMinus aria-hidden /> Deactivate</Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled={reactivating}
                          onClick={() => onReactivate(u)} aria-label={`Reactivate ${u.full_name}`}><RotateCcw aria-hidden /> Reactivate</Button>
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
  );
}
