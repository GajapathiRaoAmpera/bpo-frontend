import type { Metadata } from "next";

import { ScreenGuard } from "@/components/shell/screen-guard";
import { ClaimsPage } from "@/views/claims/claims-page";

export const metadata: Metadata = { title: "Claims" };

export default function Page() {
  return (
    <ScreenGuard screen="claims">
      <ClaimsPage />
    </ScreenGuard>
  );
}
