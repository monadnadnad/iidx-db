import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";
import { PaginationSchema } from "../../domain/pagination";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const repository = new SupabaseSongRepository(client);

  const result = await getValidatedQuery(
    event,
    PaginationSchema.extend({
      q: z.string().trim().optional(),
    }).safeParse,
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Query Parameter",
      data: z.treeifyError(result.error),
    });
  }

  const query = result.data;
  const songs = await repository.listSongs(query);

  return songs;
});
