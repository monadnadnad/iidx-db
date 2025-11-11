import { describe, expect, it, vi } from "vitest";

import { ListRecommendationsUseCase } from "~~/server/application/recommendations/listRecommendationsUseCase";
import type { RecommendationRepository } from "~~/server/application/recommendations/recommendationRepository";
import type { RecommendationResponse } from "~~/server/application/recommendations/schema";
import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from "~~/server/domain/pagination";

const createRepositoryMock = () => {
  return {
    list: vi.fn<RecommendationRepository["list"]>(),
  };
};

const makeRecommendation = (overrides: Partial<RecommendationResponse> = {}): RecommendationResponse => ({
  id: 1,
  chartId: 42,
  playSide: "1P",
  optionType: "REGULAR",
  comment: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  laneText1P: undefined,
  ...overrides,
});

describe("ListRecommendationsUseCase", () => {
  it("parses query params, calls repository", async () => {
    const repository = createRepositoryMock();
    const useCase = new ListRecommendationsUseCase(repository);
    const expected = makeRecommendation();
    repository.list.mockResolvedValue([expected]);

    const result = await useCase.execute({
      chartId: 12,
      playSide: "2P",
      optionType: "RANDOM",
      laneText: "1234567",
      perPage: 1,
    });

    expect(repository.list).toHaveBeenCalledWith(
      {
        chartId: 12,
        playSide: "2P",
        optionType: "RANDOM",
        laneText1P: "7654321",
      },
      {
        page: DEFAULT_PAGE,
        perPage: 1,
      },
    );
    expect(result).toEqual([expected]);
  });

  it("throws when validation fails", async () => {
    const repository = createRepositoryMock();
    const useCase = new ListRecommendationsUseCase(repository);

    await expect(useCase.execute({ optionType: "INVALID" })).rejects.toThrowError();
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("throws when laneText is invalid", async () => {
    const repository = createRepositoryMock();
    const useCase = new ListRecommendationsUseCase(repository);

    await expect(
      useCase.execute({
        playSide: "1P",
        laneText: "1234566",
      }),
    ).rejects.toThrowError();
    expect(repository.list).not.toHaveBeenCalled();
  });

  it("passes pagination params as a separate argument", async () => {
    const repository = createRepositoryMock();
    const useCase = new ListRecommendationsUseCase(repository);
    repository.list.mockResolvedValue([]);

    await useCase.execute({
      page: 3,
      perPage: 10,
    });

    expect(repository.list).toHaveBeenCalledWith(
      {
        chartId: undefined,
        playSide: undefined,
        optionType: undefined,
        laneText1P: undefined,
      },
      {
        page: 3,
        perPage: 10,
      },
    );
  });

  it("uses pagination defaults when none are provided", async () => {
    const repository = createRepositoryMock();
    const useCase = new ListRecommendationsUseCase(repository);
    repository.list.mockResolvedValue([]);

    await useCase.execute({});

    expect(repository.list).toHaveBeenCalledWith(
      {
        chartId: undefined,
        playSide: undefined,
        optionType: undefined,
        laneText1P: undefined,
      },
      {
        page: DEFAULT_PAGE,
        perPage: DEFAULT_PER_PAGE,
      },
    );
  });
});
