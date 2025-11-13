import { getPaginationRange } from "~~/server/domain/pagination";
import { RecommendationViewSchema, type Recommendation } from "~~/server/domain/recommendation/model";
import type { ListRecommendationsParams, RecommendationRepository } from "~~/server/domain/recommendation/repository";
import type { SupabaseClient } from "~~/server/infrastructure/supabase/client";
import type { Database } from "~~/types/database.types";
const TABLE_RECOMMENDATIONS = "chart_recommendations";

type RecommendationRow = Omit<Database["public"]["Tables"]["chart_recommendations"]["Row"], "user_id">;

export class SupabaseRecommendationRepository implements RecommendationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listRecommendations(params: ListRecommendationsParams) {
    const { perPage, page, chartId, optionType, laneText1P } = params;
    let query = this.client
      .from(TABLE_RECOMMENDATIONS)
      .select("id, chart_id, play_side, option_type, comment, lane_text_1p, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (chartId) {
      query = query.eq("chart_id", chartId);
    }

    if (optionType) {
      query = query.eq("option_type", optionType);
    }

    if (laneText1P) {
      query = query.eq("lane_text_1p", laneText1P);
    }

    const { from, to } = getPaginationRange({ perPage, page });
    const { data, error } = await query.range(from, to);

    if (error || !data) {
      throw error;
    }

    return data.map((row: RecommendationRow) => {
      const laneText1P = row.lane_text_1p;
      const playSide = row.play_side;
      const laneText = laneText1P && playSide === "2P" ? mirror(laneText1P) : (laneText1P ?? undefined);
      return RecommendationViewSchema.parse({
        recommendationId: row.id,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        chartId: row.chart_id,
        playSide,
        laneText,
        optionType: row.option_type,
        comment: row.comment,
      });
    });
  }

  async createRecommendation(recommendation: Recommendation) {
    const { chartId, playSide, optionType, comment } = recommendation;
    const laneText =
      optionType === "RANDOM"
        ? recommendation.laneText
        : optionType === "R-RANDOM" && recommendation.laneText
          ? recommendation.laneText
          : undefined;
    const laneText1P = laneText && playSide === "2P" ? mirror(laneText) : laneText;
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

    return RecommendationViewSchema.parse({
      recommendationId: recommendationRow.id,
      createdAt: new Date(recommendationRow.created_at).toISOString(),
      updatedAt: new Date(recommendationRow.updated_at).toISOString(),
      chartId,
      playSide,
      laneText,
      optionType,
      comment,
    });
  }
}
