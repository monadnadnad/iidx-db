import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { ListSongsUseCase } from "~~/server/application/songs/listSongsUseCase";
import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const repository = new SupabaseSongRepository(client);
  const useCase = new ListSongsUseCase(repository);

  try {
    return await useCase.execute();
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 500,
        statusMessage: "Song schema validation failed",
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
