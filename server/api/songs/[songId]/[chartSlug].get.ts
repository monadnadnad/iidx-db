import z from "zod";

import { DrizzleSongRepository } from "~~/server/infrastructure/drizzle/songRepository";
import { getDrizzleClient } from "~~/server/utils/db";

export default defineEventHandler(async (event) => {
  const db = getDrizzleClient();
  const repository = new DrizzleSongRepository(db);

  const result = await getValidatedRouterParams(
    event,
    z.object({
      songId: z.coerce.number().int().positive(),
      chartSlug: z.enum(CHART_SLUGS),
    }).safeParse,
  );
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid song chart parameters",
      data: z.treeifyError(result.error),
    });
  }

  const params = result.data;
  const chart = await repository.findChart({
    songId: params.songId,
    slug: params.chartSlug,
  });

  if (!chart) {
    throw createError({
      statusCode: 404,
      statusMessage: "Chart not found",
    });
  }

  return chart;
});
