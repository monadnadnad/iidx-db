import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { ListRecommendationsUseCase } from "~~/server/application/recommendations/listRecommendationsUseCase";
import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const repository = new SupabaseRecommendationRepository(client);
  const useCase = new ListRecommendationsUseCase(repository);

  try {
    const rawQuery = getQuery(event);
    return await useCase.execute(rawQuery);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid recommendation query",
        data: z.treeifyError(error),
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch recommendations",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
