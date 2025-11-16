import z from "zod";

import { DrizzleSongRepository } from "~~/server/infrastructure/drizzle/songRepository";
import { getDrizzleClient } from "~~/server/utils/db";
import { omitPagination, resolvePagination, withPagination } from "../../domain/pagination";

export default defineEventHandler(async (event) => {
  const db = getDrizzleClient();
  const repository = new DrizzleSongRepository(db);

  const result = await getValidatedQuery(
    event,
    withPagination({
      q: z.string().trim().optional(),
    }).safeParse,
  );

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Query Parameter",
      data: z.treeifyError(result.error),
    });
  }

  const pagination = resolvePagination(result.data);
  const filters = omitPagination(result.data);

  const songs = await repository.listSongs({
    ...filters,
    ...pagination,
  });

  return songs;
});
