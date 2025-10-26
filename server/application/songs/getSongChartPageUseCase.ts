import {
  SongChartDetailSchema,
  SongChartPageResponseSchema,
  SongChartRouteParamsSchema,
  type SongChartPageResponse,
} from "./schema";
import type { SongRepository } from "./songRepository";
import type { RecommendationRepository } from "../recommendations/recommendationRepository";
import { resolveChartSlug } from "~~/server/domain/songs";

export class GetSongChartPageUseCase {
  constructor(
    private readonly songRepository: Pick<SongRepository, "detail">,
    private readonly recommendationRepository: Pick<RecommendationRepository, "list">,
  ) {}

  async execute(input: unknown): Promise<SongChartPageResponse> {
    const params = SongChartRouteParamsSchema.parse(input);
    const slugDefinition = resolveChartSlug(params.chartSlug);

    const rawDetail = await this.songRepository.detail({
      songId: params.songId,
      slug: slugDefinition.slug,
    });
    const detail = SongChartDetailSchema.parse(rawDetail);

    const recommendations = await this.recommendationRepository.list({
      chartId: detail.chart.id,
    });

    return SongChartPageResponseSchema.parse({
      ...detail,
      recommendations,
    });
  }
}
