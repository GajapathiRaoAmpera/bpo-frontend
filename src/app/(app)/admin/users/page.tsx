import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { UsersPage } from "@/views/admin/users-page";

export const metadata: Metadata = { title: "Users & Roles" };

export default function Page() {
  return (
    <ScreenGuard screen="users">
      <UsersPage />
    </ScreenGuard>
  );
}
