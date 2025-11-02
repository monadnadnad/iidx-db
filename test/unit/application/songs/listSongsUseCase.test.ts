import { describe, expect, it, vi } from "vitest";

import { ListSongsUseCase } from "~~/server/application/songs/listSongsUseCase";
import type { SongSummary } from "~~/server/application/songs/schema";
import type { SongRepository } from "~~/server/application/songs/songRepository";

const createRepositoryMock = () => ({
  list: vi.fn<SongRepository["list"]>(),
});

const makeSongSummary = (overrides: Partial<SongSummary> = {}): SongSummary => ({
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
    const expected = makeSongSummary();
    repository.list.mockResolvedValue([expected]);

    const useCase = new ListSongsUseCase(repository);
    const result = await useCase.execute({});

    expect(repository.list).toHaveBeenCalledTimes(1);
    expect(result).toEqual([expected]);
  });
});
