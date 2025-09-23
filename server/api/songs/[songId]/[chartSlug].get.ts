import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";
import { supabase } from "../../../utils/supabase";

export default defineEventHandler(async (event) => {
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

  const { song, ...chart } = chartData;

  if (!song) {
    throw createError({ statusCode: 500, statusMessage: "Related song not found." });
  }

  const { data: optionPosts, error: optionPostsError } = await supabase
    .from("chart_option_posts")
    .select("id, chart_id, option_type, comment, created_at, updated_at")
    .eq("chart_id", chart.id)
    .order("created_at", { ascending: false });

  if (optionPostsError) {
    throw createError({ statusCode: 500, statusMessage: optionPostsError.message });
  }

  const { data: haichiPosts, error: haichiPostsError } = await supabase
    .from("chart_haichi_posts")
    .select("id, chart_id, lane_text, comment, created_at, updated_at")
    .eq("chart_id", chart.id)
    .order("created_at", { ascending: false });

  if (haichiPostsError) {
    throw createError({ statusCode: 500, statusMessage: haichiPostsError.message });
  }

  return {
    song,
    chart: { ...chart, slug: normalizedSlug as ChartSlug },
    optionPosts,
    haichiPosts,
  };
});
