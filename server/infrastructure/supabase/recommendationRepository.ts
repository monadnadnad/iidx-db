import type {
  CreateRecommendationParams,
  ListRecommendationsParams,
  RecommendationRepository,
} from "~~/server/application/recommendations/recommendationRepository";
import {
  RecommendationResponseSchema,
  type RecommendationResponse,
} from "~~/server/application/recommendations/schema";
import type { SupabaseClient } from "~~/server/infrastructure/supabase/client";
import type { Database } from "~~/types/database.types";

const TABLE_RECOMMENDATIONS = "chart_recommendations";

type RecommendationRow = Omit<Database["public"]["Tables"]["chart_recommendations"]["Row"], "user_id">;

export class SupabaseRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(params: ListRecommendationsParams): Promise<RecommendationResponse[]> {
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

    const { data, error } = await query;

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to fetch recommendations");
    }

    return data.map((row) => this.toResponse(row));
  }

  async create(params: CreateRecommendationParams): Promise<RecommendationResponse> {
    const { data: recommendationRow, error: recommendationError } = await this.client
      .from(TABLE_RECOMMENDATIONS)
      .insert({
        chart_id: params.chartId,
        play_side: params.playSide,
        option_type: params.optionType,
        comment: params.comment,
        lane_text_1p: params.laneText1P ?? null,
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
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      laneText1P: row.lane_text_1p ?? undefined,
    });
  }
}
