import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { CampaignValues } from "@/components/campaigns/utils";
import { api, type Schemas, unwrap } from "@/lib/api";

type Campaign = Schemas["CampaignOut"];
const KEY = ["campaigns"] as const;

// Calls start at the opening of the 09:00 IST calling window on the chosen day.
const toScheduled = (d: string) => (d ? `${d}T09:00:00+05:30` : null);

export function useCampaigns() {
  return useQuery({ queryKey: KEY, queryFn: () => unwrap(api.GET("/api/v1/campaigns")) });
}

/** Success toast + refresh of the campaign list. */
export function useCampaignDone() {
  const qc = useQueryClient();
  return (msg: string) => {
    toast.success(msg);
    void qc.invalidateQueries({ queryKey: KEY });
  };
}

export function useSubmitCampaign() {
  const done = useCampaignDone();
  return useMutation({
    mutationFn: (c: Campaign) => unwrap(api.POST("/api/v1/campaigns/{campaign_id}/submit", { params: { path: { campaign_id: c.id } } })),
    onSuccess: (c) => done(`“${c.name}” sent for approval`),
    onError: (e) => toast.error(e.message),
  });
}

export function useLaunchCampaign() {
  const qc = useQueryClient();
  const done = useCampaignDone();
  return useMutation({
    mutationFn: (c: Campaign) => unwrap(api.POST("/api/v1/campaigns/{campaign_id}/launch", { params: { path: { campaign_id: c.id } } })),
    onSuccess: (r) => {
      done(`${r.call_ids.length} simulated calls placed for “${r.campaign.name}”`);
      void qc.invalidateQueries({ queryKey: ["calls"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useAudience(v: CampaignValues, enabled: boolean) {
  return useQuery({
    queryKey: ["campaigns", "audience", v.product, v.renewal_within_days, v.languages.join(",")],
    queryFn: () => unwrap(api.GET("/api/v1/campaigns/audience", {
      params: { query: { product: v.product, renewal_within_days: v.renewal_within_days, languages: v.languages } },
    })),
    enabled: enabled && v.languages.length > 0 && v.renewal_within_days >= 1 && v.renewal_within_days <= 90,
  });
}

export function useSaveCampaign(campaign: Campaign | null, onSaved: (c: Campaign, submitted: boolean) => void) {
  return useMutation({
    mutationFn: async ({ values, submit }: { values: CampaignValues; submit: boolean }) => {
      const body = {
        name: values.name, product: values.product, scheduled_at: toScheduled(values.start_date),
        segment: { renewal_within_days: values.renewal_within_days, languages: values.languages },
      };
      let saved = campaign
        ? await unwrap(api.PATCH("/api/v1/campaigns/{campaign_id}", { params: { path: { campaign_id: campaign.id } }, body }))
        : await unwrap(api.POST("/api/v1/campaigns", { body }));
      if (submit) saved = await unwrap(api.POST("/api/v1/campaigns/{campaign_id}/submit", { params: { path: { campaign_id: saved.id } } }));
      return { saved, submit };
    },
    onSuccess: ({ saved, submit }) => onSaved(saved, submit),
    onError: (e) => toast.error(e.message),
  });
}
