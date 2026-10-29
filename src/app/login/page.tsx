import { Headset, Languages, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/app/login/login-form";
import { Brand } from "@/components/shell/brand";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Sign in" };

const POINTS = [
  { icon: ShieldCheck, title: "Compliant on every call",
    text: "AI disclosure, identity verification and figures straight from policy records, with a QA score for each call." },
  { icon: Headset, title: "People stay in control",
    text: "One-click takeover, an escalation queue, and maker-checker approval for every script and campaign." },
  { icon: Languages, title: "Built for Indian insurance",
    text: "Motor, health and term renewals in English, Tamil and Hindi, with INR and IST throughout." },
];

export default function LoginPage() {
  return (
    <>
      <div className="grid min-h-screen grid-cols-[minmax(0,5fr)_minmax(0,7fr)] pt-7">
        <aside className="flex flex-col justify-between bg-primary p-12 text-on-primary">
          <Brand inverted />
          <div className="flex max-w-md flex-col gap-space-xl">
            <h1 className="text-display text-on-primary">
              AI contact centre for renewals, reminders and policy service
            </h1>
            <ul className="flex flex-col gap-space-lg">
              {POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-space-md">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-container">
                    <Icon aria-hidden className="size-[18px]" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-label-md">{title}</span>
                    <span className="text-body-sm text-on-primary/75">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-label-sm text-on-primary/60">Sandbox edition · all customer data is synthetic</p>
        </aside>

        <main className="flex items-center justify-center px-gutter-desktop py-12">
          <div className="flex w-full max-w-[440px] flex-col gap-space-xl rounded-lg border border-divider bg-surface-container-lowest p-8 shadow-card">
            <div className="flex flex-col gap-1">
              <h2 className="text-headline-lg text-on-surface">Sign in</h2>
              <p className="text-body-sm text-on-surface-variant">Use your AssureVoice work account.</p>
            </div>
            <Suspense fallback={<Skeleton className="h-96 rounded-lg" />}>
              <LoginForm />
            </Suspense>
          </div>
        </main>
      </div>
    </>
  );
}
