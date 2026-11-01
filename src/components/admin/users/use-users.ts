"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

export type User = Schemas["UserAdminRow"];
export type UserValues = { email: string; full_name: string; job_title: string; role: Schemas["Role"]; password: string };

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => unwrap(api.GET("/api/v1/users")),
  });
}

export function useRbacMatrix() {
  return useQuery({
    queryKey: ["rbac", "matrix"],
    queryFn: () => unwrap(api.GET("/api/v1/rbac/matrix")),
    staleTime: Infinity,
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ user, active }: { user: User; active: boolean }) => active
      ? unwrap(api.PATCH("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } }, body: { is_active: true } }))
      : unwrap(api.DELETE("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } } })),
    onSuccess: (u) => {
      toast.success(u.is_active ? `${u.full_name} can sign in again` : `${u.full_name} is deactivated and signed out`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

/** Create (user undefined) or edit a staff account. */
export function useSaveUser({ user, isSelf, onSaved, onError }: {
  user?: User;
  isSelf: boolean;
  onSaved: () => void;
  onError: (message: string) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: UserValues) => user
      ? unwrap(api.PATCH("/api/v1/users/{user_id}", { params: { path: { user_id: user.id } },
        body: { full_name: v.full_name, job_title: v.job_title, role: isSelf ? undefined : v.role, password: v.password || undefined } }))
      : unwrap(api.POST("/api/v1/users", { body: v })),
    onSuccess: (saved) => {
      toast.success(user ? `Saved changes to ${saved.full_name}` : `Added ${saved.full_name}`);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      onSaved();
    },
    onError: (e) => onError(e.message),
  });
}
