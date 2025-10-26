import type { OptionType, PlaySide } from "~~/shared/types";

import type { RecommendationResponse } from "./schema";

export type ListRecommendationsParams = {
  chartId?: number;
  playSide: PlaySide;
  optionType?: OptionType;
  laneText1P?: string;
};

export type CreateRecommendationParams = {
  chartId: number;
  playSide: PlaySide;
  optionType: OptionType;
  comment: string | null;
  laneText1P?: string;
};

export interface RecommendationRepository {
  list(params: ListRecommendationsParams): Promise<RecommendationResponse[]>;
  create(params: CreateRecommendationParams): Promise<RecommendationResponse>;
}
