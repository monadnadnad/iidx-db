import type { Database } from "~~/types/schema";
import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";
import { Constants } from "~~/types/schema";
import { supabase } from "../../../utils/supabase";

type SongRow = Database["public"]["Tables"]["songs"]["Row"];
type ChartRow = Database["public"]["Tables"]["charts"]["Row"];
type VoteSummaryRow = Database["public"]["Views"]["chart_option_vote_summary"]["Row"];
type SongSummary = Pick<SongRow, "id" | "title" | "bpm_min" | "bpm_max" | "textage_tag">;
type Response = {
  song: SongSummary;
  chart: ChartRow & { slug: ChartSlug };
  optionVotes: Array<{
    chart_id: ChartRow["id"];
    option_type: VoteSummaryRow["option_type"];
    vote_count: number;
  }>;
};

const optionTypes = Constants.public.Enums.option_type as readonly VoteSummaryRow["option_type"][];

export default defineEventHandler(async (event): Promise<Response> => {
  const songIdParam = getRouterParam(event, "songId");
  const chartSlugParam = getRouterParam(event, "chartSlug");

  if (!songIdParam || !chartSlugParam) {
    throw createError({ statusCode: 400, statusMessage: "songId and chartSlug are required." });
  }

  const songId = Number(songIdParam);
  if (!Number.isInteger(songId)) {
    throw createError({ statusCode: 400, statusMessage: "songId must be an integer." });
  }

  const normalizedSlug = chartSlugParam.toLowerCase();
  const slugDefinition = chartSlugMap[normalizedSlug as ChartSlug];
  if (!slugDefinition) {
    throw createError({ statusCode: 404, statusMessage: "Chart slug not recognized." });
  }

  const { data: chartData, error: chartError } = await supabase
    .from("charts")
    .select(
      `
        id, song_id, play_mode, diff, level, notes,
        song:song_id!inner ( id, title, bpm_min, bpm_max, textage_tag )
      `,
    )
    .eq("song_id", songId)
    .eq("play_mode", slugDefinition.mode)
    .eq("diff", slugDefinition.diff)
    .single();

  if (chartError || !chartData) {
    throw createError({ statusCode: 404, statusMessage: "Chart not found." });
  }

  const { song: rawSong, ...chart } = chartData;
  // ユニークキー制約がないのでハンドルする
  const song = Array.isArray(rawSong) ? rawSong[0] : rawSong;

  if (!song) {
    throw createError({ statusCode: 500, statusMessage: "Related song not found." });
  }

  const { data: voteSummaries, error: voteSummaryError } = await supabase
    .from("chart_option_vote_summary")
    .select("option_type, vote_count")
    .eq("chart_id", chart.id);

  if (voteSummaryError) {
    throw createError({ statusCode: 500, statusMessage: voteSummaryError.message });
  }

  const voteMap = new Map((voteSummaries ?? []).map((summary) => [summary.option_type, summary.vote_count]));

  const optionVotes: Response["optionVotes"] = optionTypes.map((optionType) => ({
    chart_id: chart.id,
    option_type: optionType,
    vote_count: voteMap.get(optionType) ?? 0,
  }));

  return {
    song,
    chart: { ...chart, slug: normalizedSlug as ChartSlug },
    optionVotes,
  };
});
