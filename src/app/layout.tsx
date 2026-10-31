import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/app/providers";
import { SandboxBanner } from "@/components/shell/sandbox-banner";
import { IS_SANDBOX } from "@/lib/personas";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "AssureVoice AI";

export const metadata: Metadata = {
  title: { default: appName, template: `%s · ${appName}` },
  description: `AI contact centre for insurance renewals, premium reminders and policy service${IS_SANDBOX ? " (sandbox edition)" : ""}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} h-full`} data-env={IS_SANDBOX ? "sandbox" : "production"}>
      <body className="min-h-full">
        {IS_SANDBOX && <SandboxBanner />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
