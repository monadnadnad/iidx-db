import { and, desc, eq } from "drizzle-orm";

import type { ListRecommendationsParams, RecommendationRepository } from "~~/server/domain/recommendation/repository";
import { RecommendationViewSchema, type Recommendation } from "~~/server/domain/recommendation/model";
import type { DrizzleQueryClient } from "~~/server/utils/db";
import { tables } from "~~/server/utils/db";
import type { LaneText } from "~~/shared/utils/laneText";
import { mirror } from "~~/shared/utils/laneText";

const { chartRecommendations } = tables;

export class DrizzleRecommendationRepository implements RecommendationRepository {
  constructor(private readonly db: DrizzleQueryClient) {}

  async listRecommendations(params: ListRecommendationsParams) {
    const conditions = [
      params.chartId ? eq(chartRecommendations.chartId, params.chartId) : undefined,
      params.optionType ? eq(chartRecommendations.optionType, params.optionType) : undefined,
      params.laneText1P ? eq(chartRecommendations.laneText1P, params.laneText1P) : undefined,
    ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));

    const rows = await this.db
      .select()
      .from(chartRecommendations)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(chartRecommendations.createdAt))
      .offset(params.offset)
      .limit(params.limit);

    return rows.map((row) => {
      const laneText1P = row.laneText1P as LaneText | null;
      const laneText = laneText1P && row.playSide === "2P" ? mirror(laneText1P) : laneText1P ?? undefined;

      return RecommendationViewSchema.parse({
        recommendationId: row.id,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        chartId: row.chartId,
        playSide: row.playSide,
        laneText,
        optionType: row.optionType,
        comment: row.comment,
      });
    });
  }

  async createRecommendation(recommendation: Recommendation) {
    const { chartId, playSide, optionType, comment } = recommendation;
    const laneText
      = optionType === "RANDOM"
        ? recommendation.laneText
        : optionType === "R-RANDOM" && recommendation.laneText
          ? recommendation.laneText
          : undefined;
    const laneText1P = laneText && playSide === "2P" ? mirror(laneText) : laneText;

    const rows = await this.db
      .insert(chartRecommendations)
      .values({
        chartId,
        playSide,
        optionType,
        comment,
        laneText1P,
      })
      .returning();

    const row = rows.at(0);

    if (!row) {
      throw new Error("Failed to store recommendation");
    }

    return RecommendationViewSchema.parse({
      recommendationId: row.id,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      chartId,
      playSide,
      laneText,
      optionType,
      comment,
    });
  }
}
