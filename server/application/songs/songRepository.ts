import type { ChartSlug } from "~~/shared/utils/chartSlug";

import type { SongChartDetail, SongSummary } from "./schema";

export type SongDetailParams = {
  songId: number;
  slug: ChartSlug;
};

export interface SongRepository {
  list(): Promise<SongSummary[]>;
  detail(params: SongDetailParams): Promise<SongChartDetail>;
}
