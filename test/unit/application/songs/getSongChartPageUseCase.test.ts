import { describe, expect, it, vi } from "vitest";

import { GetSongChartPageUseCase } from "~~/server/application/songs/getSongChartPageUseCase";
import type { SongRepository } from "~~/server/application/songs/songRepository";
import type { SongChartDetail, SongChartPageResponse } from "~~/server/application/songs/schema";
import type { RecommendationRepository } from "~~/server/application/recommendations/recommendationRepository";
import type { RecommendationResponse } from "~~/server/application/recommendations/schema";

const createSongRepositoryMock = () => ({
  detail: vi.fn<SongRepository["detail"]>(),
});

const createRecommendationRepositoryMock = () => ({
  list: vi.fn<RecommendationRepository["list"]>(),
});

const makeSongChartDetail = (overrides: Partial<SongChartDetail> = {}): SongChartDetail => ({
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

const makeRecommendation = (overrides: Partial<RecommendationResponse> = {}): RecommendationResponse => ({
  id: 1,
  chartId: 10,
  playSide: "1P",
  optionType: "REGULAR",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  ...overrides,
});

describe("GetSongChartPageUseCase", () => {
  it("loads song/chart detail and its recommendations", async () => {
    const songRepository = createSongRepositoryMock();
    const recommendationRepository = createRecommendationRepositoryMock();
    const detail = makeSongChartDetail();
    const recommendations = [makeRecommendation()];
    songRepository.detail.mockResolvedValue(detail);
    recommendationRepository.list.mockResolvedValue(recommendations);

    const useCase = new GetSongChartPageUseCase(songRepository, recommendationRepository);

    const result = await useCase.execute({ songId: "1", chartSlug: "SPA" });

    const expected: SongChartPageResponse = {
      ...detail,
      recommendations,
    };
    expect(songRepository.detail).toHaveBeenCalledWith({ songId: 1, slug: "spa" });
    expect(recommendationRepository.list).toHaveBeenCalledWith({ chartId: detail.chart.id });
    expect(result).toEqual(expected);
  });

  it("rejects when the slug is unknown", async () => {
    const songRepository = createSongRepositoryMock();
    const recommendationRepository = createRecommendationRepositoryMock();

    const useCase = new GetSongChartPageUseCase(songRepository, recommendationRepository);
    await expect(useCase.execute({ songId: "1", chartSlug: "unknown" })).rejects.toThrowError(/slug/i);

    expect(songRepository.detail).not.toHaveBeenCalled();
    expect(recommendationRepository.list).not.toHaveBeenCalled();
  });

  it("rejects when repository detail violates schema", async () => {
    const songRepository = createSongRepositoryMock();
    const recommendationRepository = createRecommendationRepositoryMock();
    songRepository.detail.mockResolvedValue({
      ...makeSongChartDetail(),
      chart: {
        ...makeSongChartDetail().chart,
        // @ts-expect-error invalid diff to trigger schema error
        diff: "Z",
      },
    });

    const useCase = new GetSongChartPageUseCase(songRepository, recommendationRepository);
    await expect(useCase.execute({ songId: 1, chartSlug: "spa" })).rejects.toThrowError();

    expect(recommendationRepository.list).not.toHaveBeenCalled();
  });
});
