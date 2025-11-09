import { describe, expect, it, vi } from "vitest";

import {
  ListSongsUseCase,
  type SongListQuery,
  type SongWithCharts,
} from "~~/server/application/songs/listSongsUseCase";
import type { SongRepository } from "~~/server/application/songs/songRepository";

const createRepositoryMock = () => ({
  list: vi.fn<SongRepository["list"]>(),
});

const makeSongWithCharts = (overrides: Partial<SongWithCharts> = {}): SongWithCharts => ({
  id: 1,
  title: "冥",
  textage_tag: "mei",
  bpm_min: 100,
  bpm_max: 200,
  charts: [
    {
      id: 10,
      song_id: 1,
      play_mode: "SP",
      diff: "A",
      level: 12,
      notes: 2000,
      slug: "spa",
    },
  ],
  ...overrides,
});

describe("ListSongsUseCase", () => {
  it("returns parsed song summaries from the repository", async () => {
    const repository = createRepositoryMock();
    const expected = makeSongWithCharts();
    repository.list.mockResolvedValue([expected]);
    const query: SongListQuery = { page: 1, perPage: 20 };

    const useCase = new ListSongsUseCase(repository);
    const result = await useCase.execute(query);

    expect(repository.list).toHaveBeenCalledWith(query);
    expect(result).toEqual([expected]);
  });
});
