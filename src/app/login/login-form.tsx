"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ME_KEY } from "@/hooks/use-me";
import { api, type Schemas, unwrap } from "@/lib/api";
import { initials } from "@/lib/format";
import { IS_SANDBOX, personaEmail, SANDBOX_PERSONAS } from "@/lib/personas";
import { SCREEN_HREF, screenForPath } from "@/lib/routes";

const schema = z.object({
  email: z.email("Enter your work email, e.g. name@sandbox.assurevoice.in"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

// Only same-site paths the role can open; otherwise the role's landing page.
function destination(next: string | null, me: Schemas["MeOut"]): string {
  if (next?.startsWith("/") && !next.startsWith("//")) {
    const screen = screenForPath(next.split("?")[0]!);
    if (screen && me.nav.some((n) => n.screen === screen)) return next;
  }
  return SCREEN_HREF[me.landing];
}

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<Values>({ resolver: zodResolver(schema), mode: "onTouched", defaultValues: { email: "", password: "" } });
  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: Values) {
    setServerError(null);
    try {
      const me = await unwrap(api.POST("/api/v1/auth/login", { body: values }));
      queryClient.setQueryData(ME_KEY, me);
      toast.success(`Signed in as ${me.user.full_name}`);
      router.replace(destination(next, me));
    } catch (e) {
      setServerError((e as Error).message);
    }
  }

  function pickPersona(name: string) {
    form.setValue("email", personaEmail(name), { shouldValidate: true });
    setServerError(null);
    form.setFocus("password");
  }

  return (
    <div className="flex flex-col gap-space-xl">
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-space-lg">
        {serverError && (
          <div role="alert" className="flex items-start gap-space-sm rounded-lg border border-danger-border bg-danger-bg p-space-md text-body-sm text-danger-text">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-label-md text-on-surface">Work email</Label>
          <Input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined} {...form.register("email")} />
          {errors.email && <p id="email-error" className="text-label-sm text-danger-text">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-label-md text-on-surface">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
              className="pr-10" aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined} {...form.register("password")} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-outline hover:text-on-surface focus-visible:outline-2 focus-visible:outline-lang-border">
              {showPassword ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
            </button>
          </div>
          {errors.password && <p id="password-error" className="text-label-sm text-danger-text">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 aria-hidden className="animate-spin" />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {IS_SANDBOX && (
      <section aria-labelledby="personas-heading" className="flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-md">
          <span className="h-px flex-1 bg-divider" />
          <h2 id="personas-heading" className="text-label-xs tracking-wider text-outline uppercase">Sandbox personas</h2>
          <span className="h-px flex-1 bg-divider" />
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Pick a persona to fill the email, then enter the sandbox password.
        </p>
        <ul className="grid grid-cols-2 gap-space-sm">
          {SANDBOX_PERSONAS.map((p) => (
            <li key={p.role}>
              <button type="button" onClick={() => pickPersona(p.name)}
                className="flex w-full items-center gap-space-sm rounded-lg border border-divider bg-surface-container-lowest p-space-sm text-left transition-colors hover:border-neutral-border hover:bg-table-head focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lang-border">
                <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm text-primary">
                  {initials(p.name)}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-label-md text-on-surface">{p.name}</span>
                  <span className="truncate text-label-sm text-on-surface-variant">{p.roleLabel}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      )}
    </div>
  );
}
