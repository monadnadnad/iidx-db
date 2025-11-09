import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { ListSongsUseCase, SongListQuerySchema } from "~~/server/application/songs/listSongsUseCase";
import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const repository = new SupabaseSongRepository(client);
  const useCase = new ListSongsUseCase(repository);

  try {
    const query = await getValidatedQuery(event, SongListQuerySchema.parse);
    return await useCase.execute(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid song query",
        data: z.treeifyError(error),
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch songs",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
