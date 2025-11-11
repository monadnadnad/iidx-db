import { serverSupabaseClient } from "#supabase/server";
import z from "zod";

import { SupabaseSongRepository } from "~~/server/infrastructure/supabase/songRepository";
import type { Database } from "~~/types/database.types";

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event);
  const repository = new SupabaseSongRepository(client);

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
