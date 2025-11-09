import { z } from "zod";

import { PaginationSchema } from "../pagination";
import type { SongRepository } from "./songRepository";
import { ChartSchema, SongSchema } from "./songSchemas";

export const SongWithChartsSchema = SongSchema.extend({
  charts: z.array(ChartSchema),
});
export type SongWithCharts = z.infer<typeof SongWithChartsSchema>;

export const SongListResponseSchema = z.array(SongWithChartsSchema);
export type SongListResponse = z.infer<typeof SongListResponseSchema>;

export const SongListQuerySchema = PaginationSchema.extend({
  q: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? undefined : value))
    .optional(),
});
export type SongListQuery = z.infer<typeof SongListQuerySchema>;

export class ListSongsUseCase {
  constructor(private readonly repository: Pick<SongRepository, "list">) {}

  async execute(query: SongListQuery): Promise<SongListResponse> {
    const songs = await this.repository.list(query);
    return SongListResponseSchema.parse(songs);
  }
}
