import { supabase } from "../../utils/supabase";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  const { data, error } = await supabase.from("songs").select("*, charts(*)").eq("id", id).single();

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }

  return data;
});
