import { z } from "zod";

import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";

import type { SongRepository } from "./songRepository";
import { ChartSchema, SongSchema } from "./songSchemas";

export const SONG_CHART_NOT_FOUND_MESSAGE = "Song chart not found";

export const ChartDetailRouteParamsSchema = z.object({
  songId: z.coerce.number().int().positive(),
  chartSlug: z
    .string()
    .refine((value) => value.toLowerCase() in chartSlugMap, "Invalid chart slug")
    .transform((value) => value.toLowerCase() as ChartSlug),
});
export type ChartDetailRouteParams = z.infer<typeof ChartDetailRouteParamsSchema>;

export const ChartDetailResponseSchema = z.object({
  song: SongSchema,
  chart: ChartSchema,
});
export type ChartDetailResponse = z.infer<typeof ChartDetailResponseSchema>;

export class GetChartDetailUseCase {
  constructor(private readonly songRepository: Pick<SongRepository, "detail">) {}

  async execute(params: ChartDetailRouteParams): Promise<ChartDetailResponse> {
    const rawDetail = await this.songRepository.detail({
      songId: params.songId,
      slug: params.chartSlug,
    });
    if (!rawDetail) {
      throw new Error(SONG_CHART_NOT_FOUND_MESSAGE);
    }
    return ChartDetailResponseSchema.parse(rawDetail);
  }
}
