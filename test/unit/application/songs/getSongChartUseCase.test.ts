import { describe, expect, it, vi } from "vitest";

import {
  GetChartDetailUseCase,
  type ChartDetailResponse,
  type ChartDetailRouteParams,
} from "~~/server/application/songs/getChartDetailUseCase";
import type { SongRepository } from "~~/server/application/songs/songRepository";

const createSongRepositoryMock = () => ({
  detail: vi.fn<SongRepository["detail"]>(),
});

const makeSongChartDetail = (overrides: Partial<ChartDetailResponse> = {}): ChartDetailResponse => ({
  song: {
    id: 1,
    title: "冥",
    textage_tag: "mei",
    bpm_min: 100,
    bpm_max: 200,
    ...overrides.song,
  },
  chart: {
    id: 10,
    song_id: 1,
    play_mode: "SP",
    diff: "A",
    level: 12,
    notes: 2000,
    slug: "spa",
    ...(overrides.chart ?? {}),
  },
});

const makeRouteParams = (overrides: Partial<ChartDetailRouteParams> = {}): ChartDetailRouteParams => ({
  songId: 1,
  chartSlug: "spa",
  ...overrides,
});

describe("GetChartDetailUseCase", () => {
  it("loads song/chart detail", async () => {
    const songRepository = createSongRepositoryMock();
    const detail = makeSongChartDetail();
    songRepository.detail.mockResolvedValue(detail);

    const useCase = new GetChartDetailUseCase(songRepository);

    const result = await useCase.execute(makeRouteParams());

    expect(songRepository.detail).toHaveBeenCalledWith({ songId: 1, slug: "spa" });
    expect(result).toEqual(detail);
  });

  it("rejects when repository detail violates schema", async () => {
    const songRepository = createSongRepositoryMock();
    songRepository.detail.mockResolvedValue({
      ...makeSongChartDetail(),
      chart: {
        ...makeSongChartDetail().chart,
        // @ts-expect-error invalid diff to trigger schema error
        diff: "Z",
      },
    });

    const useCase = new GetChartDetailUseCase(songRepository);

    await expect(useCase.execute(makeRouteParams())).rejects.toThrowError();
  });

  it("throws when the chart is not found", async () => {
    const songRepository = createSongRepositoryMock();
    songRepository.detail.mockResolvedValue(null);
    const useCase = new GetChartDetailUseCase(songRepository);

    await expect(useCase.execute(makeRouteParams())).rejects.toThrowError(/not found/i);
  });
});
