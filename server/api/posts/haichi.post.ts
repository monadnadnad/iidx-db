import { serverSupabaseClient } from "#supabase/server";

import { isValidHaichi } from "~~/shared/utils/haichi";
import type { TablesInsert } from "~~/types/database.types";

type HaichiPostInsert = TablesInsert<"chart_haichi_posts">;

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const payload = await readBody<HaichiPostInsert | null>(event);
  const chartId = payload?.chart_id;
  const laneText = typeof payload?.lane_text === "string" ? payload.lane_text.trim() : "";
  const rawComment = typeof payload?.comment === "string" ? payload.comment.trim() : undefined;
  const comment = rawComment && rawComment.length > 0 ? rawComment : null;

  if (!chartId || !laneText) {
    throw createError({
      statusCode: 400,
      statusMessage: "chart_id and lane_text are required",
    });
  }

  if (!isValidHaichi(laneText)) {
    throw createError({
      statusCode: 400,
      statusMessage: `lane_text is not valid`,
    });
  }

  if (comment && comment.length > 255) {
    throw createError({ statusCode: 400, statusMessage: "comment must be 255 characters or fewer" });
  }

  const { error } = await client.from("chart_haichi_posts").insert({
    chart_id: chartId,
    lane_text: laneText,
    comment,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { status: "ok" };
});
