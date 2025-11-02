import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 50;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(DEFAULT_PAGE),
  perPage: z.coerce.number().int().min(1).max(MAX_PER_PAGE).optional().default(DEFAULT_PER_PAGE),
});

export type Pagination = z.infer<typeof PaginationSchema>;
