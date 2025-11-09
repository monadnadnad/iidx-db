import { getPaginationRange } from "~~/server/application/pagination";
import { ChartDetailResponseSchema } from "~~/server/application/songs/getChartDetailUseCase";
import {
  SongWithChartsSchema,
  type SongListQuery,
  type SongListResponse,
} from "~~/server/application/songs/listSongsUseCase";
import type { SongDetailParams, SongRepository } from "~~/server/application/songs/songRepository";
import { chartSlugMap, getChartSlug } from "~~/shared/utils/chartSlug";
import type { SupabaseClient } from "./client";

const TABLE_SONGS = "songs";
const TABLE_CHARTS = "charts";

export class SupabaseSongRepository implements SongRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(query: SongListQuery): Promise<SongListResponse> {
    const { q } = query;
    let supabaseQuery = this.client
      .from(TABLE_SONGS)
      .select(
        `
        id, title, textage_tag, bpm_min, bpm_max,
        charts (
          id, song_id, play_mode, diff, level, notes
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
            const slug = getChartSlug(chart.play_mode, chart.diff);
            if (!slug) return null;
            return {
              ...chart,
              slug,
            };
          })
          .filter((chart): chart is NonNullable<typeof chart> => chart !== null),
      });
    });
  }

  async detail(params: SongDetailParams) {
    const slugDefinition = chartSlugMap[params.slug];

    const { data, error } = await this.client
      .from(TABLE_CHARTS)
      .select(
        `
        id, song_id, play_mode, diff, level, notes,
        song:song_id!inner (
          id, title, textage_tag, bpm_min, bpm_max
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

    return ChartDetailResponseSchema.parse({
      song: data.song,
      chart: {
        id: data.id,
        song_id: data.song_id,
        play_mode: data.play_mode,
        diff: data.diff,
        level: data.level,
        notes: data.notes,
        slug: params.slug,
      },
    });
  }
}
