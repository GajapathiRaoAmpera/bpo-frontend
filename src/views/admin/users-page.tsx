"use client";

import { UserPlus } from "lucide-react";
import { useState } from "react";

import { DeactivateUserDialog } from "@/components/admin/users/deactivate-user-dialog";
import { PermissionMatrix } from "@/components/admin/users/permission-matrix";
import { type User, useSetUserActive, useUsers } from "@/components/admin/users/use-users";
import { UserDialog } from "@/components/admin/users/user-dialog";
import { UsersTable } from "@/components/admin/users/users-table";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/use-me";

import styles from "./users-page.module.scss";

export function UsersPage() {
  const { data: me } = useMe();
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<User | null>(null);

  const { data, isLoading, error, refetch } = useUsers();
  const setActive = useSetUserActive();

  return (
    <div className={styles.page}>
      <PageHeader
        title="Users & Roles"
        description="Staff accounts and their roles. Accounts are deactivated, never deleted, so the audit trail stays intact. Every change is audited."
        actions={<Button onClick={() => setCreating(true)}><UserPlus aria-hidden /> Add user</Button>}
      />

      <UsersTable users={data} isLoading={isLoading} error={error} onRetry={() => refetch()} meId={me?.user.id}
        onAdd={() => setCreating(true)} onEdit={setEditing} onDeactivate={setDeactivating}
        onReactivate={(user) => setActive.mutate({ user, active: true })} reactivating={setActive.isPending} />

      <PermissionMatrix />

      <UserDialog open={creating || editing !== null} user={editing ?? undefined} isSelf={editing?.id === me?.user.id}
        onOpenChange={(o) => { if (!o) { setCreating(false); setEditing(null); } }} />

      <DeactivateUserDialog user={deactivating} onClose={() => setDeactivating(null)}
        onConfirm={(user) => setActive.mutate({ user, active: false })} />
    </div>
  );
}
