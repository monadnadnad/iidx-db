import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import type { Database } from "~~/types/database.types";
import { RecommendationQuerySchema, RecommendationResponseSchema } from "./recommendations/schema";

const TABLE_RECOMMENDATIONS = "chart_recommendations";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);

  const rawQuery = getQuery(event);
  const parsed = RecommendationQuerySchema.safeParse(rawQuery);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid recommendation query",
      data: z.treeifyError(parsed.error),
    });
  }

  const { chartId, playSide, optionType, laneText } = parsed.data;

  let query = client
    .from(TABLE_RECOMMENDATIONS)
    .select(
      `
      id, chart_id, play_side, option_type, comment, created_at,
      lane:chart_recommendation_lane_texts(lane_text_1p)
      `,
    )
    .order("created_at", { ascending: false });

  if (chartId !== undefined) {
    query = query.eq("chart_id", chartId);
  }

  if (playSide) {
    query = query.eq("play_side", playSide);
  }

  if (optionType) {
    query = query.eq("option_type", optionType);
  }

  if (laneText) {
    const laneText1P = toLaneText1P(playSide ?? "1P", laneText);
    query = query.eq("chart_recommendation_lane_texts.lane_text_1p", laneText1P);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch recommendations",
      data: error?.message,
    });
  }

  const responses = data.map((row) => {
    return RecommendationResponseSchema.parse({
      id: row.id,
      chartId: row.chart_id,
      createdAt: row.created_at,
      playSide: row.play_side,
      optionType: row.option_type,
      comment: row.comment ?? undefined,
      laneText1P: row.lane?.lane_text_1p ?? undefined,
    });
  });

  return responses;
});
