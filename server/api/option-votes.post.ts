import type { TablesInsert } from "~~/types/schema";
import { supabase } from "../utils/supabase";

type VoteInsert = TablesInsert<"option_votes">;

export default defineEventHandler(async (event) => {
  const { chart_id, option_type } = await readBody<VoteInsert>(event);

  if (!chart_id || !option_type) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing chart_id or option_type",
    });
  }

  const { error } = await supabase.from("option_votes").insert({ chart_id, option_type });

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return { status: "ok" };
});
