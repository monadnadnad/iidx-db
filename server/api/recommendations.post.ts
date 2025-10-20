import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import z from "zod";

import type { Database } from "~~/types/database.types";
import { RecommendationPostSchema, RecommendationResponseSchema } from "./recommendations/schema";

const TABLE_RECOMMENDATIONS = "chart_recommendations";
const TABLE_LANE_TEXTS = "chart_recommendation_lane_texts";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const client = await serverSupabaseClient<Database>(event);

  const rawBody = await readBody(event);
  const parsed = RecommendationPostSchema.safeParse(rawBody);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid recommendation payload",
      data: z.treeifyError(parsed.error),
    });
  }

  const { chartId, playSide, optionType, comment, laneText1P } = parsed.data;

  const { data: recommendationRow, error: recommendationError } = await client
    .from(TABLE_RECOMMENDATIONS)
    .insert({
      chart_id: chartId,
      play_side: playSide,
      option_type: optionType,
      comment,
      user_id: user.id,
    })
    .select("id, chart_id, play_side, option_type, comment, created_at")
    .single();

  if (recommendationError || !recommendationRow) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to store recommendation",
      data: recommendationError?.message,
    });
  }

  if (laneText1P) {
    const { error: laneError } = await client
      .from(TABLE_LANE_TEXTS)
      .insert({
        recommendation_id: recommendationRow.id,
        lane_text_1p: laneText1P,
      })
      .select("lane_text_1p")
      .single();

    if (laneError) {
      await client.from(TABLE_RECOMMENDATIONS).delete().eq("id", recommendationRow.id);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to store laneText",
        data: laneError.message,
      });
    }
  }

  return RecommendationResponseSchema.parse({
    id: recommendationRow.id,
    chartId: recommendationRow.chart_id,
    playSide: recommendationRow.play_side,
    optionType: recommendationRow.option_type,
    comment: recommendationRow.comment,
    createdAt: recommendationRow.created_at,
    laneText1P,
  });
});
