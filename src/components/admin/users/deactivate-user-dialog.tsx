"use client";

import type { User } from "@/components/admin/users/use-users";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeactivateUserDialog({ user, onClose, onConfirm }: {
  user: User | null;
  onClose: () => void;
  onConfirm: (user: User) => void;
}) {
  return (
    <AlertDialog open={user !== null} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate {user?.full_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            They are signed out at once and can&apos;t sign in until reactivated. Their history and audit entries are kept.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep active</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => user && onConfirm(user)}>
            Deactivate {user?.full_name.split(" ")[0]}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
