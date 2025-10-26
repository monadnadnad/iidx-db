import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { CreateRecommendationUseCase } from "~~/server/application/recommendations/createRecommendationUseCase";
import { LaneTextValidationError } from "~~/server/domain/recommendations";
import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError) {
    throw createError({
      statusCode: 401,
      statusMessage: userError.message,
    });
  }
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const repository = new SupabaseRecommendationRepository(client);
  const useCase = new CreateRecommendationUseCase(repository);

  try {
    const rawBody = await readBody(event);
    return await useCase.execute(rawBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid recommendation payload",
        data: z.treeifyError(error),
      });
    }
    if (error instanceof LaneTextValidationError) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to store recommendation",
      data: error instanceof Error ? error.message : String(error),
    });
  }
});
