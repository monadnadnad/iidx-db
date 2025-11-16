import { and, eq, ilike } from "drizzle-orm";

import { ChartViewSchema, SongWithChartsSchema } from "~~/server/domain/song/model";
import type { FindChartParams, ListSongsParams, SongRepository } from "~~/server/domain/song/repository";
import type { DrizzleClient } from "~~/server/utils/db";
import { tables } from "~~/server/utils/db";

const { songs, charts } = tables;

export class DrizzleSongRepository implements SongRepository {
  constructor(private readonly db: DrizzleClient) {}

  async listSongs(query: ListSongsParams) {
    const rows = await this.db.query.songs.findMany({
      where: query.q ? ilike(songs.title, `%${query.q}%`) : undefined,
      with: { charts: true },
      orderBy: (row, { asc }) => asc(row.id),
      limit: query.limit,
      offset: query.offset,
    });

    return rows.map((row) => {
      return SongWithChartsSchema.parse({
        id: row.id,
        title: row.title,
        textage_tag: row.textageTag,
        bpm_min: row.bpmMin,
        bpm_max: row.bpmMax,
        charts: row.charts
          .map((chart) => {
            const chartSlug = `${chart.playMode}${chart.diff}`.toLowerCase();
            if (!(chartSlug in chartSlugMap)) return null;
            return {
              id: chart.id,
              level: chart.level,
              notes: chart.notes,
              chartSlug: chartSlug as ChartSlug,
            } as const;
          })
          .filter((chart): chart is NonNullable<typeof chart> => chart !== null),
      });
    });
  }

  async findChart(params: FindChartParams) {
    const slugDefinition = chartSlugMap[params.slug];
    if (!slugDefinition) {
      return null;
    }

    const row = await this.db.query.charts.findFirst({
      where: and(
        eq(charts.songId, params.songId),
        eq(charts.playMode, slugDefinition.mode),
        eq(charts.diff, slugDefinition.diff),
      ),
      with: {
        song: true,
      },
    });

    if (!row || !row.song) {
      return null;
    }

    return ChartViewSchema.parse({
      id: row.id,
      songId: row.songId,
      title: row.song.title,
      textage_tag: row.song.textageTag,
      bpm_min: row.song.bpmMin,
      bpm_max: row.song.bpmMax,
      level: row.level,
      notes: row.notes,
      chartSlug: params.slug,
    });
  }
}
