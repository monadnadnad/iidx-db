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
const TABLE_LANE_TEXTS = "chart_recommendation_lane_texts";

type RecommendationRow = Omit<Database["public"]["Tables"]["chart_recommendations"]["Row"], "user_id">;

export class SupabaseRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(params: ListRecommendationsParams): Promise<RecommendationResponse[]> {
    let query = this.client
      .from(TABLE_RECOMMENDATIONS)
      .select(
        `
        id, chart_id, play_side, option_type, comment, created_at, updated_at,
        lane:chart_recommendation_lane_texts(lane_text_1p)
        `,
      )
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
      query = query.eq("chart_recommendation_lane_texts.lane_text_1p", params.laneText1P);
    }

    const { data, error } = await query;

    if (error || !data) {
      throw new Error(error?.message ?? "Failed to fetch recommendations");
    }

    return data.map((row) => this.toResponse(row, row.lane?.lane_text_1p ?? undefined));
  }

  async create(params: CreateRecommendationParams): Promise<RecommendationResponse> {
    const { data: recommendationRow, error: recommendationError } = await this.client
      .from(TABLE_RECOMMENDATIONS)
      .insert({
        chart_id: params.chartId,
        play_side: params.playSide,
        option_type: params.optionType,
        comment: params.comment,
        user_id: params.userId,
      })
      .select("id, chart_id, play_side, option_type, comment, created_at, updated_at")
      .single();

    if (recommendationError || !recommendationRow) {
      throw new Error(recommendationError?.message ?? "Failed to store recommendation");
    }

    if (params.laneText1P) {
      const { error: laneError } = await this.client
        .from(TABLE_LANE_TEXTS)
        .insert({
          recommendation_id: recommendationRow.id,
          lane_text_1p: params.laneText1P,
        })
        .single();

      if (laneError) {
        await this.client.from(TABLE_RECOMMENDATIONS).delete().eq("id", recommendationRow.id);
        throw new Error(laneError?.message ?? "Failed to store lane text");
      }
    }

    return this.toResponse(recommendationRow, params.laneText1P);
  }

  private toResponse(row: RecommendationRow, laneText1P?: string): RecommendationResponse {
    return RecommendationResponseSchema.parse({
      id: row.id,
      chartId: row.chart_id,
      playSide: row.play_side,
      optionType: row.option_type,
      comment: row.comment,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      laneText1P,
    });
  }
}
