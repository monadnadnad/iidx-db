import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { PaginationSchema } from "~~/server/domain/pagination";
import { SupabaseRecommendationRepository } from "~~/server/infrastructure/supabase/recommendationRepository";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const repository = new SupabaseRecommendationRepository(client);

  const result = await getValidatedQuery(
    event,
    PaginationSchema.extend({
      viewPlaySide: z.enum(PLAY_SIDES).default("1P"),
      chartId: z.coerce.number().int().positive().optional(),
      optionType: z.enum(OPTION_TYPES).optional(),
      laneText: LaneTextSchema.optional(),
    }).safeParse,
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid recommendation query",
      data: z.treeifyError(result.error),
    });
  }

  const { laneText, viewPlaySide, ...rest } = result.data;
  const laneText1P = laneText && viewPlaySide === "2P" ? mirror(laneText) : laneText;

  return await repository.listRecommendations({
    laneText1P,
    ...rest,
  });
});
