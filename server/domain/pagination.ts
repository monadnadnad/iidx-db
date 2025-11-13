import { z } from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 50;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  perPage: z.coerce.number().int().min(1).max(MAX_PER_PAGE).default(DEFAULT_PER_PAGE),
});

export type Pagination = z.infer<typeof PaginationSchema>;

export const getPaginationRange = ({ page, perPage }: Pagination) => {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  return { from, to };
};
