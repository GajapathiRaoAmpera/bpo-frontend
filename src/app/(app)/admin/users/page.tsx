import type { Metadata } from "next";

import { UsersAdmin } from "@/app/(app)/admin/users/users-admin";
import { ScreenGuard } from "@/components/shell/screen-guard";

export const metadata: Metadata = { title: "Users & Roles" };

export default function Page() {
  return (
    <ScreenGuard screen="users">
      <UsersAdmin />
    </ScreenGuard>
  );
}
