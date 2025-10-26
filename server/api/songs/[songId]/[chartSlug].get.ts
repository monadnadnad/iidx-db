import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { GetSongChartPageUseCase } from "~~/server/application/songs/getSongChartPageUseCase";
import { ChartNotFoundError, UnknownChartSlugError } from "~~/server/domain/songs";
import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";
import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const songRepository = new SupabaseSongRepository(client);
  const recommendationRepository = new SupabaseRecommendationRepository(client);
  const useCase = new GetSongChartPageUseCase(songRepository, recommendationRepository);

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

    if (error instanceof UnknownChartSlugError || error instanceof ChartNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: error.message,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch chart page data",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
