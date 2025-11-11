import type { Pagination } from "../pagination";
import type { ChartView, SongWithCharts } from "./model";

export type ListSongsParams = Pagination & {
  q?: string;
};

export type FindChartParams = {
  songId: number;
  slug: ChartSlug;
};

export interface SongRepository {
  listSongs(query: ListSongsParams): Promise<SongWithCharts[]>;
  findChart(params: FindChartParams): Promise<ChartView | null>;
}
