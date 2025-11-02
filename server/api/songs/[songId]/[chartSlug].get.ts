import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { GetSongChartUseCase } from "~~/server/application/songs/getSongChartUseCase";
import { SONG_CHART_NOT_FOUND_MESSAGE } from "~~/server/application/songs/schema";
import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const songRepository = new SupabaseSongRepository(client);
  const useCase = new GetSongChartUseCase(songRepository);

  try {
    return await useCase.execute({
      songId: getRouterParam(event, "songId"),
      chartSlug: getRouterParam(event, "chartSlug"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid song chart parameters",
        data: z.treeifyError(error),
      });
    }

    if (error instanceof Error && error.message === SONG_CHART_NOT_FOUND_MESSAGE) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch chart data",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
