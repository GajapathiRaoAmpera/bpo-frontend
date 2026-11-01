"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { api, type Schemas, unwrap } from "@/lib/api";

type Script = Schemas["ScriptOut"];
type Draft = { name: string; system_prompt: string };

export const SCRIPTS_KEY = ["scripts"] as const;

export function useScripts() {
  return useQuery({ queryKey: SCRIPTS_KEY, queryFn: () => unwrap(api.GET("/api/v1/scripts")) });
}

// Save / submit / fork for one script; `onSaved` toasts, selects the result and refreshes the list.
export function useScriptActions(script: Script, onSaved: (s: Script, msg: string) => void) {
  const path = { params: { path: { script_id: script.id } } };

  const save = useMutation({
    mutationFn: (body: Draft) => unwrap(api.PATCH("/api/v1/scripts/{script_id}", { ...path, body })),
    onSuccess: (s) => onSaved(s, "Draft saved"),
    onError: (e) => toast.error(e.message),
  });
  const submit = useMutation({
    mutationFn: async (draft: Draft | null) => {
      if (draft) await unwrap(api.PATCH("/api/v1/scripts/{script_id}", { ...path, body: draft }));
      return unwrap(api.POST("/api/v1/scripts/{script_id}/submit", path));
    },
    onSuccess: (s) => onSaved(s, `v${s.version} sent for approval`),
    onError: (e) => toast.error(e.message),
  });
  const fork = useMutation({
    mutationFn: () => unwrap(api.POST("/api/v1/scripts", {
      body: { name: script.name, mode: script.mode, system_prompt: script.system_prompt, parent_id: script.id },
    })),
    onSuccess: (s) => onSaved(s, `Draft v${s.version} created from v${script.version}`),
    onError: (e) => toast.error(e.message),
  });

  return { save, submit, fork };
}

export function useTestCall(scriptId: number) {
  return useMutation({
    mutationFn: (customerSays: string) => unwrap(api.POST("/api/v1/scripts/{script_id}/test-call", {
      params: { path: { script_id: scriptId } }, body: { customer_says: customerSays },
    })),
    onError: (e) => toast.error(e.message),
  });
}
