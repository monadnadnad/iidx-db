import z from "zod";

import { omitPagination, resolvePagination, withPagination } from "~~/server/domain/pagination";
import { DrizzleRecommendationRepository } from "~~/server/infrastructure/drizzle/recommendationRepository";
import { getDrizzleClient } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const db = getDrizzleClient();
  const repository = new DrizzleRecommendationRepository(db);

  const result = await getValidatedQuery(
    event,
    withPagination({
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
  const pagination = resolvePagination(result.data);
  const filters = omitPagination(rest);

  return await repository.listRecommendations({
    laneText1P,
    ...filters,
    ...pagination,
  });
});
