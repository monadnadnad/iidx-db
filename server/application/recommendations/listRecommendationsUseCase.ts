import { isValidLaneText, mirror } from "~~/shared/utils/laneText";

import type { ListRecommendationsParams, RecommendationRepository } from "./recommendationRepository";
import { RecommendationQuerySchema, type RecommendationResponse } from "./schema";

export class ListRecommendationsUseCase {
  constructor(private readonly repository: Pick<RecommendationRepository, "list">) {}

  async execute(input: unknown): Promise<RecommendationResponse[]> {
    const query = RecommendationQuerySchema.parse(input);
    const laneText = query.laneText?.trim();
    if (laneText && !isValidLaneText(laneText)) {
      throw new Error("laneText is not valid");
    }

    const params: ListRecommendationsParams = {
      chartId: query.chartId,
      playSide: query.playSide,
      optionType: query.optionType,
      laneText1P: query.playSide === "2P" && laneText ? mirror(laneText) : laneText,
    };

    return this.repository.list(params);
  }
}
