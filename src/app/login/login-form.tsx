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

import styles from "./login-form.module.scss";

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
    <div className={styles.root}>
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className={styles.form}>
        {serverError && (
          <div role="alert" className={styles.alert}>
            <CircleAlert aria-hidden className={styles.alertIcon} />
            <span>{serverError}</span>
          </div>
        )}
        <div className={styles.field}>
          <Label htmlFor="email" className={styles.label}>Work email</Label>
          <Input id="email" type="email" autoComplete="username" aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined} {...form.register("email")} />
          {errors.email && <p id="email-error" className={styles.error}>{errors.email.message}</p>}
        </div>
        <div className={styles.field}>
          <Label htmlFor="password" className={styles.label}>Password</Label>
          <div className={styles.passwordWrap}>
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password"
              className={styles.passwordInput} aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined} {...form.register("password")} />
            <button type="button" onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={styles.reveal}>
              {showPassword ? <EyeOff aria-hidden className={styles.revealIcon} /> : <Eye aria-hidden className={styles.revealIcon} />}
            </button>
          </div>
          {errors.password && <p id="password-error" className={styles.error}>{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting} className={styles.submit}>
          {isSubmitting && <Loader2 aria-hidden className={styles.spinner} />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {IS_SANDBOX && (
      <section aria-labelledby="personas-heading" className={styles.personas}>
        <div className={styles.personasHead}>
          <span className={styles.rule} />
          <h2 id="personas-heading" className={styles.personasTitle}>Sandbox personas</h2>
          <span className={styles.rule} />
        </div>
        <p className={styles.hint}>
          Pick a persona to fill the email, then enter the sandbox password.
        </p>
        <ul className={styles.personaList}>
          {SANDBOX_PERSONAS.map((p) => (
            <li key={p.role}>
              <button type="button" onClick={() => pickPersona(p.name)}
                className={styles.persona}>
                <span aria-hidden className={styles.avatar}>
                  {initials(p.name)}
                </span>
                <span className={styles.personaText}>
                  <span className={styles.personaName}>{p.name}</span>
                  <span className={styles.personaRole}>{p.roleLabel}</span>
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
