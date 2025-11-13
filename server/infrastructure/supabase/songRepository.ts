import { getPaginationRange } from "~~/server/domain/pagination";
import { ChartViewSchema, SongWithChartsSchema } from "~~/server/domain/song/model";
import type { FindChartParams, ListSongsParams, SongRepository } from "~~/server/domain/song/repository";
import type { SupabaseClient } from "./client";

const TABLE_SONGS = "songs";
const TABLE_CHARTS = "charts";

export class SupabaseSongRepository implements SongRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listSongs(query: ListSongsParams) {
    const { q } = query;
    let supabaseQuery = this.client
      .from(TABLE_SONGS)
      .select(
        `
        id, title, textage_tag, bpm_min, bpm_max,
        charts (
          id, play_mode, diff, level, notes
        )
      `,
      )
      .order("id", { ascending: true });

    if (q) {
      supabaseQuery = supabaseQuery.ilike("title", `%${q}%`);
    }

    const { from, to } = getPaginationRange(query);
    const { data, error } = await supabaseQuery.range(from, to);

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to fetch songs");
    }

    return data.map((row) => {
      return SongWithChartsSchema.parse({
        id: row.id,
        title: row.title,
        textage_tag: row.textage_tag,
        bpm_min: row.bpm_min,
        bpm_max: row.bpm_max,
        charts: row.charts
          .map((chart) => {
            const { play_mode, diff, ...rest } = chart;
            const chartSlug = (play_mode + diff).toLowerCase();
            if (!Object.keys(chartSlugMap).includes(chartSlug)) return null;
            return {
              ...rest,
              chartSlug,
            };
          })
          .filter((chart): chart is NonNullable<typeof chart> => chart !== null),
      });
    });
  }

  async findChart(params: FindChartParams) {
    const slugDefinition = chartSlugMap[params.slug];

    const { data, error } = await this.client
      .from(TABLE_CHARTS)
      .select(
        `
        id, song_id, level, notes,
        song:song_id!inner (
          title, textage_tag, bpm_min, bpm_max
        )
      `,
      )
      .eq("song_id", params.songId)
      .eq("play_mode", slugDefinition.mode)
      .eq("diff", slugDefinition.diff)
      .single();

    if (error || !data) {
      return null;
    }

    return ChartViewSchema.parse({
      id: data.id,
      songId: data.song_id,
      title: data.song.title,
      textage_tag: data.song.textage_tag,
      bpm_min: data.song.bpm_min,
      bpm_max: data.song.bpm_max,
      level: data.level,
      notes: data.notes,
      chartSlug: params.slug,
    });
  }
}
