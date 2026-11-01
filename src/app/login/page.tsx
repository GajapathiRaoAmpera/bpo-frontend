import type { Metadata } from "next";

import { LoginPage } from "@/views/login/login-page";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return <LoginPage />;
}
