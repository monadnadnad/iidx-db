import { SongListQuerySchema, SongListResponseSchema, type SongListQuery, type SongListResponse } from "./schema";
import type { SongRepository } from "./songRepository";

export class ListSongsUseCase {
  constructor(private readonly repository: Pick<SongRepository, "list">) {}

  async execute(input: unknown): Promise<SongListResponse> {
    const query: SongListQuery = SongListQuerySchema.parse(input);
    const songs = await this.repository.list(query);
    return SongListResponseSchema.parse(songs);
  }
}
