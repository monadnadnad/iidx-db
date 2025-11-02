import {
  SongChartDetailSchema,
  SongChartRouteParamsSchema,
  SONG_CHART_NOT_FOUND_MESSAGE,
  type SongChartDetail,
} from "./schema";
import type { SongRepository } from "./songRepository";

export class GetSongChartUseCase {
  constructor(private readonly songRepository: Pick<SongRepository, "detail">) {}

  async execute(input: unknown): Promise<SongChartDetail> {
    const params = SongChartRouteParamsSchema.parse(input);

    const rawDetail = await this.songRepository.detail({
      songId: params.songId,
      slug: params.chartSlug,
    });
    if (!rawDetail) {
      throw new Error(SONG_CHART_NOT_FOUND_MESSAGE);
    }
    return SongChartDetailSchema.parse(rawDetail);
  }
}
