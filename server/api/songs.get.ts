import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);

  const { data, error } = await client
    .from("songs")
    .select("id,title,textage_tag,bpm_min,bpm_max,charts(id,play_mode,diff,level,notes)");

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  return data;
});
