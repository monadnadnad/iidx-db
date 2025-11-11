import { z } from "zod";
import { CHART_SLUGS } from "../../../shared/types";

export const SongSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  textage_tag: z.string().nullable(),
  bpm_min: z.number(),
  bpm_max: z.number(),
});

export const ChartSchema = z.object({
  chart_slug: z.enum(CHART_SLUGS),
  level: z.number().int().positive(),
  notes: z.number().int().nonnegative(),
});

export const ChartViewSchema = ChartSchema.extend({
  song_id: SongSchema.shape.id,
  title: SongSchema.shape.title,
  textage_tag: SongSchema.shape.textage_tag,
  bpm_min: SongSchema.shape.bpm_min,
  bpm_max: SongSchema.shape.bpm_max,
});

export const SongWithChartsSchema = SongSchema.extend({
  charts: z.array(ChartSchema),
});

export type Song = z.infer<typeof SongSchema>;
export type Chart = z.infer<typeof ChartSchema>;
export type ChartView = z.infer<typeof ChartViewSchema>;
export type SongWithCharts = z.infer<typeof SongWithChartsSchema>;
