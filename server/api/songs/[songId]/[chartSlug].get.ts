import { serverSupabaseClient } from "#supabase/server";
import { RecommendationResponseSchema } from "~~/server/api/recommendations/schema";
import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

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

  const { data: chartData, error: chartError } = await client
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

  const { song, ...chart } = chartData;

  const { data: recommendationRows, error: recommendationsError } = await client
    .from("chart_recommendations")
    .select(
      `
      id, chart_id, play_side, option_type, comment, created_at,
      lane:chart_recommendation_lane_texts(lane_text_1p)
      `,
    )
    .eq("chart_id", chart.id)
    .order("created_at", { ascending: false });

  if (recommendationsError) {
    throw createError({ statusCode: 500, statusMessage: recommendationsError.message });
  }

  const recommendations = (recommendationRows ?? []).map((row) => {
    return RecommendationResponseSchema.parse({
      id: row.id,
      chartId: row.chart_id,
      playSide: row.play_side,
      optionType: row.option_type,
      comment: row.comment,
      createdAt: row.created_at,
      laneText1P: row.lane?.lane_text_1p,
    });
  });

  return {
    song,
    chart: { ...chart, slug: normalizedSlug as ChartSlug },
    recommendations,
  };
});
