import type { ChartSlug } from "~~/shared/utils/chartSlug";

import type { ChartDetailResponse } from "./getChartDetailUseCase";
import type { SongListQuery, SongListResponse } from "./listSongsUseCase";

export type SongDetailParams = {
  songId: number;
  slug: ChartSlug;
};

export interface SongRepository {
  list(query: SongListQuery): Promise<SongListResponse>;
  detail(params: SongDetailParams): Promise<ChartDetailResponse | null>;
}
