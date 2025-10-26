import { resolveLaneText1P } from "~~/server/domain/recommendations";

import { RecommendationPostSchema, type RecommendationResponse } from "./schema";
import type { RecommendationRepository } from "./recommendationRepository";

export class CreateRecommendationUseCase {
  constructor(private readonly repository: Pick<RecommendationRepository, "create">) {}

  async execute(input: unknown): Promise<RecommendationResponse> {
    const dto = RecommendationPostSchema.parse(input);
    const laneText1P = resolveLaneText1P(dto.playSide, dto.optionType, dto.laneText);

    return this.repository.create({
      chartId: dto.chartId,
      playSide: dto.playSide,
      optionType: dto.optionType,
      comment: dto.comment,
      laneText1P,
    });
  }
}
