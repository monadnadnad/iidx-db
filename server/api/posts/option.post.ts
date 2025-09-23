import type { TablesInsert } from "~~/types/schema";
import { supabase } from "../../utils/supabase";

type OptionPostInsert = TablesInsert<"chart_option_posts">;

export default defineEventHandler(async (event) => {
  const payload = await readBody<OptionPostInsert | null>(event);
  const chartId = payload?.chart_id;
  const optionType = payload?.option_type;
  const rawComment = typeof payload?.comment === "string" ? payload.comment.trim() : undefined;
  const comment = rawComment && rawComment.length > 0 ? rawComment : null;

  if (!chartId || !optionType) {
    throw createError({
      statusCode: 400,
      statusMessage: "chart_id and option_type are required",
    });
  }

  if (comment && comment.length > 255) {
    throw createError({ statusCode: 400, statusMessage: "comment must be 255 characters or fewer" });
  }

  const { error } = await supabase.from("chart_option_posts").insert({
    chart_id: chartId,
    option_type: optionType,
    comment,
  });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { status: "ok" };
});
