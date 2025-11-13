import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";
import { RecommendationSchema } from "../../domain/recommendation/model";

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

  const result = await readValidatedBody(event, RecommendationSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid recommendation payload",
      data: z.treeifyError(result.error),
    });
  }

  const payload = result.data;

  return await repository.createRecommendation(payload);
});
