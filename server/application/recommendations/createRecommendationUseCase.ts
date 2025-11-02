import { RecommendationSchema } from "~~/server/domain/recommendation";

import type { RecommendationRepository } from "./recommendationRepository";
import { CreateRecommendationRequestSchema, type RecommendationResponse } from "./schema";

export class CreateRecommendationUseCase {
  constructor(private readonly repository: Pick<RecommendationRepository, "create">) {}

  async execute(input: unknown): Promise<RecommendationResponse> {
    const requestDTO = CreateRecommendationRequestSchema.parse(input);
    const recommendation = RecommendationSchema.parse(requestDTO);

    return this.repository.create(recommendation);
  }
}
