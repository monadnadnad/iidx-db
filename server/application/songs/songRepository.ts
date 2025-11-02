import type { ChartSlug } from "~~/shared/utils/chartSlug";

import type { SongChartDetail, SongListQuery, SongSummary } from "./schema";

export type SongDetailParams = {
  songId: number;
  slug: ChartSlug;
};

export interface SongRepository {
  list(query: SongListQuery): Promise<SongSummary[]>;
  detail(params: SongDetailParams): Promise<SongChartDetail | null>;
}
