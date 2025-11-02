import { DEFAULT_PAGE, DEFAULT_PER_PAGE, type Pagination } from "~~/server/application/pagination";
import type {
  ListRecommendationsParams,
  RecommendationRepository,
} from "~~/server/application/recommendations/recommendationRepository";
import {
  RecommendationResponseSchema,
  type RecommendationResponse,
} from "~~/server/application/recommendations/schema";
import type { Recommendation } from "~~/server/domain/recommendation";
import type { SupabaseClient } from "~~/server/infrastructure/supabase/client";
import type { Database } from "~~/types/database.types";

const TABLE_RECOMMENDATIONS = "chart_recommendations";

type RecommendationRow = Omit<Database["public"]["Tables"]["chart_recommendations"]["Row"], "user_id">;

export class SupabaseRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(
    params: ListRecommendationsParams,
    pagination: Pagination = {
      page: DEFAULT_PAGE,
      perPage: DEFAULT_PER_PAGE,
    },
  ): Promise<RecommendationResponse[]> {
    let query = this.client
      .from(TABLE_RECOMMENDATIONS)
      .select("id, chart_id, play_side, option_type, comment, lane_text_1p, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (params.chartId !== undefined) {
      query = query.eq("chart_id", params.chartId);
    }

    if (params.playSide) {
      query = query.eq("play_side", params.playSide);
    }

    if (params.optionType) {
      query = query.eq("option_type", params.optionType);
    }

    if (params.laneText1P) {
      query = query.eq("lane_text_1p", params.laneText1P);
    }

    // 一旦ここに書いておく
    const from = (pagination.page - 1) * pagination.perPage;
    const to = from + pagination.perPage - 1;
    const { data, error } = await query.range(from, to);

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to fetch recommendations");
    }

    return data.map((row) => this.toResponse(row));
  }

  async create(recommendation: Recommendation): Promise<RecommendationResponse> {
    const { chartId, playSide, optionType, comment, laneText1P } = recommendation;

    const { data: recommendationRow, error: recommendationError } = await this.client
      .from(TABLE_RECOMMENDATIONS)
      .insert({
        chart_id: chartId,
        play_side: playSide,
        option_type: optionType,
        comment,
        lane_text_1p: laneText1P,
      })
      .select("id, chart_id, play_side, option_type, comment, lane_text_1p, created_at, updated_at")
      .single();

    if (recommendationError || !recommendationRow) {
      throw new Error(recommendationError?.message ?? "Failed to store recommendation");
    }

    return this.toResponse(recommendationRow);
  }

  private toResponse(row: RecommendationRow): RecommendationResponse {
    return RecommendationResponseSchema.parse({
      id: row.id,
      chartId: row.chart_id,
      playSide: row.play_side,
      optionType: row.option_type,
      comment: row.comment ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      laneText1P: row.lane_text_1p ?? undefined,
    });
  }
}
