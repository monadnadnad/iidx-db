import { z } from "zod";

import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";

export const SongSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  textage_tag: z.string().nullable(),
  bpm_min: z.number(),
  bpm_max: z.number(),
});

export const ChartSchema = z.object({
  id: z.number().int().positive(),
  song_id: z.number().int().positive(),
  level: z.number().int().positive(),
  notes: z.number().int().nonnegative(),
  chartSlug: z
    .string()
    .refine((value) => value.toLowerCase() in chartSlugMap, "Invalid chart slug")
    .transform((value) => value.toLowerCase() as ChartSlug),
});

export type Song = z.infer<typeof SongSchema>;
export type Chart = z.infer<typeof ChartSchema>;
