import { z } from "zod";

import { CHART_DIFFS, PLAY_MODES } from "~~/shared/types";
import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";
import { PaginationSchema } from "../pagination";

export const SongChartRouteParamsSchema = z.object({
  songId: z.coerce.number().int().positive(),
  chartSlug: z
    .string()
    .refine((value) => value.toLowerCase() in chartSlugMap, "Invalid chart slug")
    .transform((value) => value.toLowerCase() as ChartSlug),
});

export const SongSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string(),
  textage_tag: z.string().nullable(),
  bpm_min: z.number(),
  bpm_max: z.number(),
});

export const SongChartSchema = z.object({
  id: z.number().int().positive(),
  song_id: z.coerce.number().int().positive(),
  play_mode: z.enum(PLAY_MODES),
  diff: z.enum(CHART_DIFFS),
  level: z.number().int().nonnegative().nullable(),
  notes: z.number().int().nonnegative().nullable(),
});

export const SongChartWithSlugSchema = SongChartSchema.extend({
  slug: z
    .string()
    .refine((value) => value.toLowerCase() in chartSlugMap, "Invalid chart slug")
    .transform((value) => value.toLowerCase() as ChartSlug),
});

export const SongSummarySchema = SongSchema.extend({
  charts: z.array(SongChartWithSlugSchema),
});

export const SongListResponseSchema = z.array(SongSummarySchema);

export const SongChartDetailSchema = z.object({
  song: SongSchema,
  chart: SongChartWithSlugSchema,
});

export const SongListQuerySchema = PaginationSchema.extend({
  q: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional(),
});

export const SONG_CHART_NOT_FOUND_MESSAGE = "Song chart not found";

export type SongSummary = z.infer<typeof SongSummarySchema>;
export type SongListResponse = z.infer<typeof SongListResponseSchema>;
export type SongChartDetail = z.infer<typeof SongChartDetailSchema>;
export type SongListQuery = z.infer<typeof SongListQuerySchema>;
