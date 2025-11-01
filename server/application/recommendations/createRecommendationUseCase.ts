import { isValidLaneText, isValidRRANDOMLaneText, mirror } from "~~/shared/utils/laneText";

import type { RecommendationRepository } from "./recommendationRepository";
import { RecommendationPostSchema, type RecommendationResponse } from "./schema";

export class CreateRecommendationUseCase {
  constructor(private readonly repository: Pick<RecommendationRepository, "create">) {}

  async execute(input: unknown): Promise<RecommendationResponse> {
    const dto = RecommendationPostSchema.parse(input);
    const laneText = dto.laneText?.trim();
    if (laneText && !isValidLaneText(laneText)) {
      throw new Error("laneText is not valid");
    }

    if (dto.optionType === "RANDOM") {
      if (!laneText) {
        throw new Error("laneText is required for RANDOM");
      }
    } else if (dto.optionType === "R-RANDOM") {
      if (laneText && !isValidRRANDOMLaneText(laneText)) {
        throw new Error("laneText must match one of the defined R-RANDOM patterns.");
      }
    } else if (dto.laneText) {
      throw new Error("laneText is only allowed for RANDOM or R-RANDOM options.");
    }

    return this.repository.create({
      chartId: dto.chartId,
      playSide: dto.playSide,
      optionType: dto.optionType,
      comment: dto.comment,
      laneText1P: dto.playSide === "2P" && laneText ? mirror(laneText) : laneText,
    });
  }
}
