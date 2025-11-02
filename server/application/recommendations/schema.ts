import { z } from "zod";

import { OPTION_TYPES, PLAY_SIDES } from "~~/shared/types";

export const CreateRecommendationRequestSchema = z.object({
  chartId: z.coerce.number().int().positive(),
  playSide: z.enum(PLAY_SIDES),
  optionType: z.enum(OPTION_TYPES),
  laneText: z.string().optional(),
  comment: z.string().optional(),
});

export type CreateRecommendationRequest = z.infer<typeof CreateRecommendationRequestSchema>;

export const RecommendationResponseSchema = z.object({
  id: z.number().int().positive(),
  chartId: z.number().int().positive(),
  playSide: z.enum(PLAY_SIDES),
  optionType: z.enum(OPTION_TYPES),
  comment: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  laneText1P: z.string().optional(),
});

export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

export const RecommendationQuerySchema = z.object({
  chartId: z.coerce.number().int().positive().optional(),
  playSide: z.enum(PLAY_SIDES).optional(),
  optionType: z.enum(OPTION_TYPES).optional(),
  laneText: z.string().optional(),
});

export type RecommendationQueryParams = z.infer<typeof RecommendationQuerySchema>;
