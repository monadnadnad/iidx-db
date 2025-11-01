import { z } from "zod";

import { CHART_DIFFS, PLAY_MODES } from "~~/shared/types";
import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";
import { RecommendationResponseSchema } from "../recommendations/schema";

const playModeSchema = z.enum(PLAY_MODES);
const chartDiffSchema = z.enum(CHART_DIFFS);

const chartSlugSchema = z
  .string()
  .refine((value) => value.toLowerCase() in chartSlugMap, "Invalid chart slug")
  .transform((value) => value.toLowerCase() as ChartSlug);

export const SongIdSchema = z.coerce.number().int().positive();

export const SongChartRouteParamsSchema = z.object({
  songId: SongIdSchema,
  chartSlug: chartSlugSchema,
});

export const SongSchema = z.object({
  id: SongIdSchema,
  title: z.string(),
  textage_tag: z.string().nullable(),
  bpm_min: z.number(),
  bpm_max: z.number(),
});

export const SongChartSchema = z.object({
  id: z.number().int().positive(),
  song_id: SongIdSchema,
  play_mode: playModeSchema,
  diff: chartDiffSchema,
  level: z.number().int().nonnegative().nullable(),
  notes: z.number().int().nonnegative().nullable(),
});

export const SongChartWithSlugSchema = SongChartSchema.extend({
  slug: chartSlugSchema,
});

export const SongSummarySchema = SongSchema.extend({
  charts: z.array(SongChartWithSlugSchema),
});

export const SongListResponseSchema = z.array(SongSummarySchema);

export const SongChartDetailSchema = z.object({
  song: SongSchema,
  chart: SongChartWithSlugSchema,
});

export const SongChartPageResponseSchema = SongChartDetailSchema.extend({
  recommendations: z.array(RecommendationResponseSchema),
});

export type SongSummary = z.infer<typeof SongSummarySchema>;
export type SongListResponse = z.infer<typeof SongListResponseSchema>;
export type SongChartDetail = z.infer<typeof SongChartDetailSchema>;
export type SongChartPageResponse = z.infer<typeof SongChartPageResponseSchema>;
