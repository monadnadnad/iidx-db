import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

import { CreateRecommendationUseCase } from "~~/server/application/recommendations/createRecommendationUseCase";
import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user) {
    throw createError({
      statusCode: 401,
      statusMessage: userError?.message ?? "Authentication required",
    });
  }

  const repository = new SupabaseRecommendationRepository(client);
  const useCase = new CreateRecommendationUseCase(repository);

  const rawBody = await readBody(event);

  try {
    return await useCase.execute(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid recommendation payload",
        data: z.treeifyError(error),
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to store recommendation",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
