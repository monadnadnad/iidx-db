import { z } from "zod";

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;

const PaginationParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

type PaginationParams = z.infer<typeof PaginationParamsSchema>;

type PaginationKeys = keyof PaginationParams;

export type Pagination = {
  limit: number;
  offset: number;
};

export const resolvePagination = ({ limit, offset }: PaginationParams): Pagination => {
  const resolvedLimit = limit ?? DEFAULT_LIMIT;
  const resolvedOffset = offset ?? 0;

  return {
    limit: resolvedLimit,
    offset: resolvedOffset,
  };
};

export const withPagination = <Shape extends z.ZodRawShape>(shape: Shape) =>
  z.object({ ...shape, ...PaginationParamsSchema.shape });

export const omitPagination = <T extends PaginationParams & Record<string, unknown>>(params: T) => {
  const { limit, offset, ...rest } = params;
  return rest as Omit<T, PaginationKeys>;
};
