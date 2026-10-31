"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ROLE_LABEL, SELECT_CLASS } from "@/components/admin/labels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type Schemas, unwrap } from "@/lib/api";

import styles from "./user-dialog.module.scss";

type User = Schemas["UserAdminRow"];
const ROLES = Object.keys(ROLE_LABEL) as Schemas["Role"][];

const schema = z.object({
  email: z.email("Enter a work email, e.g. name@sandbox.assurevoice.in"),
  full_name: z.string().trim().min(2, "Enter the person's full name").max(120),
  job_title: z.string().trim().min(2, "Enter a job title").max(120),
  role: z.enum(ROLES as [Schemas["Role"], ...Schemas["Role"][]]),
  password: z.string().max(128),
});
type Values = z.infer<typeof schema>;

/** Create (user undefined) or edit a staff account. Password is required on create, optional (reset) on edit. */
export function UserDialog({ open, onOpenChange, user, isSelf }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User;
  isSelf: boolean;
}) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(schema.refine((v) => (user ? v.password === "" : false) || v.password.length >= 12, {
      path: ["password"], message: "Use at least 12 characters",
    })),
    mode: "onTouched",
    values: user
      ? { email: user.email, full_name: user.full_name, job_title: user.job_title, role: user.role, password: "" }
      : { email: "", full_name: "", job_title: "", role: "human_agent", password: "" },
  });
  const { errors } = form.formState;

  const save = useMutation({
    mutationFn: (v: Values) => user
      ? unwrap(api.PATCH("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } },
        body: { full_name: v.full_name, job_title: v.job_title, role: isSelf ? undefined : v.role, password: v.password || undefined } }))
      : unwrap(api.POST("/api/v1/users", { body: v })),
    onSuccess: (saved) => {
      toast.success(user ? `Saved changes to ${saved.full_name}` : `Added ${saved.full_name}`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
    onError: (e) => setServerError(e.message),
  });

  const field = (id: keyof Values, label: string, input: React.ReactNode) => (
    <div className={styles.field}>
      <Label htmlFor={`u-${id}`} className={styles.label}>{label}</Label>
      {input}
      {errors[id] && <p id={`u-${id}-error`} className={styles.fieldError}>{errors[id]?.message}</p>}
    </div>
  );
  const a11y = (id: keyof Values) => ({ id: `u-${id}`, "aria-invalid": !!errors[id], "aria-describedby": errors[id] ? `u-${id}-error` : undefined });

  return (
    <Dialog open={open} onOpenChange={(o) => { setServerError(null); if (!o) form.reset(); onOpenChange(o); }}>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>{user ? `Edit ${user.full_name}` : "Add user"}</DialogTitle>
          <DialogDescription className={styles.description}>
            {user ? "Changes are recorded in the audit log." : "The person signs in with this email and password. The account is recorded in the audit log."}
          </DialogDescription>
        </DialogHeader>
        <form noValidate id="user-form" onSubmit={form.handleSubmit((v) => { setServerError(null); save.mutate(v); })} className={styles.form}>
          {serverError && (
            <div role="alert" className={styles.error}>
              <CircleAlert aria-hidden className={styles.errorIcon} /><span>{serverError}</span>
            </div>
          )}
          {field("email", "Work email", <Input type="email" autoComplete="off" disabled={!!user} {...a11y("email")} {...form.register("email")} />)}
          {field("full_name", "Full name", <Input {...a11y("full_name")} {...form.register("full_name")} />)}
          {field("job_title", "Job title", <Input {...a11y("job_title")} {...form.register("job_title")} />)}
          {field("role", "Role", (
            <select className={SELECT_CLASS} disabled={isSelf} {...a11y("role")} {...form.register("role")}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          ))}
          {isSelf && <p className={styles.selfNote}>You can&apos;t change your own role.</p>}
          {field("password", user ? "New password (optional)" : "Password",
            <Input type="password" autoComplete="new-password" placeholder={user ? "Leave blank to keep the current one" : "At least 12 characters"} {...a11y("password")} {...form.register("password")} />)}
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" form="user-form" disabled={save.isPending}>
            {save.isPending && <Loader2 aria-hidden className={styles.spinner} />}
            {user ? (save.isPending ? "Saving…" : "Save changes") : (save.isPending ? "Adding…" : "Add user")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
