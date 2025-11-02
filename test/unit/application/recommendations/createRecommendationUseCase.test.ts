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
  chartId: 1,
  playSide: "2P" as const,
  optionType: "RANDOM" as const,
  laneText: "1234567",
};

const makeRecommendation = (overrides: Partial<RecommendationResponse> = {}): RecommendationResponse => ({
  id: 1,
  chartId: 1,
  playSide: "2P",
  optionType: "RANDOM",
  comment: "memo",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  laneText1P: "7654321",
  ...overrides,
});

describe("CreateRecommendationUseCase", () => {
  it("parses payloads, calls repository", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);
    const expected = makeRecommendation();
    repository.create.mockResolvedValue(expected);

    const result = await useCase.execute(basePayload);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chartId: 1,
        playSide: "2P",
        optionType: "RANDOM",
        laneText: "1234567",
        laneText1P: "7654321",
      }),
    );
    expect(result).toEqual(expected);
  });

  it("trims comments before delegating to the repository", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await useCase.execute({
      ...basePayload,
      comment: "  memo  ",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        comment: "memo",
      }),
    );
  });

  it("rejects laneText when option type does not use it", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        optionType: "REGULAR",
      }),
    ).rejects.toThrowError();
  });

  it("requires lane text input for RANDOM", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        chartId: 1,
        playSide: "1P",
        optionType: "RANDOM",
      }),
    ).rejects.toThrowError();
  });

  it("rejects invalid lane text patterns", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        laneText: "12345a7",
      }),
    ).rejects.toThrow(/Invalid lane text/);
  });

  it("rejects R-RANDOM with invalid laneText", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await expect(
      useCase.execute({
        ...basePayload,
        optionType: "R-RANDOM",
        laneText: "7654321",
      }),
    ).rejects.toThrow(/Invalid R-RANDOM lane text/);
  });

  it("accepts R-RANDOM without lane text", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await useCase.execute({
      chartId: 1,
      playSide: "1P",
      optionType: "R-RANDOM",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chartId: 1,
        playSide: "1P",
        optionType: "R-RANDOM",
      }),
    );
  });

  it("accepts valid R-RANDOM with a pattern", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await useCase.execute({
      ...basePayload,
      laneText: "1765432",
      optionType: "R-RANDOM",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chartId: 1,
        playSide: "2P",
        optionType: "R-RANDOM",
        laneText: "1765432",
        laneText1P: "2345671",
      }),
    );
  });

  it("accepts S-RANDOM without a lane text", async () => {
    const repository = createRepositoryMock();
    const useCase = new CreateRecommendationUseCase(repository);

    await useCase.execute({
      chartId: 20,
      playSide: "2P",
      optionType: "S-RANDOM",
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        chartId: 20,
        playSide: "2P",
        optionType: "S-RANDOM",
      }),
    );
  });
});
