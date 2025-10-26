import { LaneTextValidationError } from "~~/server/domain/recommendations";
import { toLaneText1P } from "~~/shared/utils/haichi";

import { RecommendationQuerySchema, type RecommendationResponse } from "./schema";
import type { ListRecommendationsParams, RecommendationRepository } from "./recommendationRepository";

export class ListRecommendationsUseCase {
  constructor(private readonly repository: Pick<RecommendationRepository, "list">) {}

  async execute(input: unknown): Promise<RecommendationResponse[]> {
    const query = RecommendationQuerySchema.parse(input);
    let laneText1P: string | undefined;
    if (query.laneText) {
      try {
        laneText1P = toLaneText1P(query.playSide, query.laneText);
      } catch (error) {
        throw new LaneTextValidationError((error as Error).message);
      }
    }

    const params: ListRecommendationsParams = {
      chartId: query.chartId,
      playSide: query.playSide,
      optionType: query.optionType,
      laneText1P,
    };

    return this.repository.list(params);
  }
}
