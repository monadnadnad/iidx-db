import { z } from "zod";

import { OPTION_TYPES, PLAY_SIDES } from "~~/shared/types";

const optionTypeSchema = z.enum(OPTION_TYPES);
const playSideSchema = z.enum(PLAY_SIDES);

const chartIdSchema = z.coerce.number().int().positive();
const laneTextSchema = z.string().length(7);
const commentSchema = z
  .string()
  .trim()
  .max(255, "comment must be 255 characters or fewer")
  .nullable()
  .transform((s) => (s === "" ? null : s))
  .default(null);

export const RecommendationPostSchema = z
  .object({
    chartId: chartIdSchema,
    playSide: playSideSchema,
    optionType: optionTypeSchema,
    laneText: laneTextSchema.optional(),
    comment: commentSchema,
  })
  .strip();

export const RecommendationQuerySchema = z
  .object({
    chartId: chartIdSchema.optional(),
    playSide: playSideSchema.default("1P"),
    optionType: optionTypeSchema.optional(),
    laneText: laneTextSchema.optional(),
  })
  .strip();

export const RecommendationResponseSchema = z.object({
  id: z.number().int().positive(),
  chartId: chartIdSchema,
  playSide: playSideSchema,
  optionType: optionTypeSchema,
  comment: commentSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  laneText1P: z.string().optional(),
});

export type RecommendationPostDto = z.output<typeof RecommendationPostSchema>;
export type RecommendationQueryParams = z.infer<typeof RecommendationQuerySchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
