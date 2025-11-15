import { serverSupabaseClient } from "#supabase/server";
import { z } from "zod";

import { DrizzleRecommendationRepository } from "~~/server/infrastructure/drizzle/recommendationRepository";
import { createSupabaseDrizzle } from "~~/server/utils/db";
import { RecommendationSchema } from "../../domain/recommendation/model";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  const result = await readValidatedBody(event, RecommendationSchema.safeParse);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid recommendation payload",
      data: z.treeifyError(result.error),
    });
  }

  const payload = result.data;

  const drizzle = createSupabaseDrizzle(session.access_token);

  return await drizzle.rls(async (db) => {
    const repository = new DrizzleRecommendationRepository(db);
    return repository.createRecommendation(payload);
  });
});
