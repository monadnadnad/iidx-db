import { SongListResponseSchema, type SongListResponse } from "./schema";
import type { SongRepository } from "./songRepository";

export class ListSongsUseCase {
  constructor(private readonly repository: Pick<SongRepository, "list">) {}

  async execute(): Promise<SongListResponse> {
    const songs = await this.repository.list();
    return SongListResponseSchema.parse(songs);
  }
}
