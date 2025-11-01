import { describe, expect, it, vi } from "vitest";

import { CreateRecommendationUseCase } from "~~/server/application/recommendations/createRecommendationUseCase";
import type { RecommendationRepository } from "~~/server/application/recommendations/recommendationRepository";
import type { RecommendationResponse } from "~~/server/application/recommendations/schema";

const createRepositoryMock = () => {
  return {
    create: vi.fn<RecommendationRepository["create"]>(),
  };
};

const basePayload = {
  chartId: "15",
  playSide: "2P" as const,
  optionType: "RANDOM" as const,
  laneText: "1234567",
  comment: "  memo ",
};

const makeRecommendation = (overrides: Partial<RecommendationResponse> = {}): RecommendationResponse => ({
  id: 99,
  chartId: 15,
  playSide: "2P",
  optionType: "RANDOM",
  comment: "memo",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  laneText1P: "7654321",
  ...overrides,
});

describe("CreateRecommendationUseCase", () => {
  it("parses payloads, derives laneText1P, and delegates to the repository", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);
    const expected = makeRecommendation();
    repository.create.mockResolvedValue(expected);

    const result = await useCase.execute(basePayload);

    expect(repository.create).toHaveBeenCalledWith({
      chartId: 15,
      playSide: "2P",
      optionType: "RANDOM",
      comment: "memo",
      laneText1P: "7654321",
    });
    expect(result).toEqual(expected);
  });

  it("rejects laneText without RANDOM nor R-RANDOM", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        optionType: "REGULAR",
        laneText: "7654321",
      }),
    ).rejects.toThrow(/laneText is only allowed/);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("requires lane text input for RANDOM", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        chartId: "15",
        playSide: "1P",
        optionType: "RANDOM",
        comment: "memo",
      }),
    ).rejects.toThrow(/laneText is required for RANDOM/);
  });

  it("rejects invalid lane text patterns", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        laneText: "12345a7",
      }),
    ).rejects.toThrow(/laneText is not valid/);
  });

  it("rejects R-RANDOM with invalid laneText", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        optionType: "R-RANDOM",
      }),
    ).rejects.toThrow(/laneText must match/);
  });

  it("accepts valid R-RANDOM", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);
    repository.create.mockResolvedValue(makeRecommendation({ laneText1P: "2345671", optionType: "R-RANDOM" }));

    await useCase.execute({
      ...basePayload,
      laneText: "1765432",
      optionType: "R-RANDOM",
    });

    expect(repository.create).toHaveBeenCalledWith({
      chartId: 15,
      playSide: "2P",
      optionType: "R-RANDOM",
      comment: "memo",
      laneText1P: "2345671",
    });
  });
});
