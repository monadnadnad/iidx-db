import type { Recommendation, RecommendationView } from "~~/server/domain/recommendation/model";
import type { LaneText } from "~~/shared/utils/laneText";
import type { Pagination } from "../pagination";

export type ListRecommendationsParams = Pagination & {
  chartId?: number;
  optionType?: OptionType;
  laneText1P?: LaneText;
};

export interface RecommendationRepository {
  listRecommendations(params: ListRecommendationsParams): Promise<RecommendationView[]>;
  createRecommendation(recommendation: Recommendation): Promise<RecommendationView>;
}
