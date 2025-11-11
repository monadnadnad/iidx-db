import type { Recommendation } from "~~/server/domain/recommendation";
import type { OptionType, PlaySide } from "~~/shared/types";
import type { Pagination } from "../../domain/pagination";
import type { RecommendationResponse } from "./schema";

export type ListRecommendationsParams = {
  chartId?: number;
  playSide?: PlaySide;
  optionType?: OptionType;
  laneText1P?: string;
};

export interface RecommendationRepository {
  list(params: ListRecommendationsParams, pagination?: Pagination): Promise<RecommendationResponse[]>;
  create(recommendation: Recommendation): Promise<RecommendationResponse>;
}
