import { z } from "zod";

import type { Schemas } from "@/lib/api";
import { LANGUAGE_LABEL } from "@/lib/labels";

export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 1000) / 10 : 0);

export const LANGUAGES = Object.keys(LANGUAGE_LABEL) as Schemas["Language"][];

export const campaignSchema = z.object({
  name: z.string().trim().min(3, "Give the campaign a name of at least 3 characters").max(160),
  product: z.enum(["motor", "health", "term_life"]),
  renewal_within_days: z.number({ error: "Enter a number of days" }).int().min(1, "At least 1 day").max(90, "At most 90 days"),
  languages: z.array(z.enum(["english", "tamil", "hindi"])).min(1, "Choose at least one language"),
  start_date: z.string(),
});
export type CampaignValues = z.infer<typeof campaignSchema>;
