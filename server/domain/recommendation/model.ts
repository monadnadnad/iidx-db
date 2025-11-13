import { z } from "zod";

const BaseSchema = z.object({
  chartId: z.number().int().positive(),
  playSide: z.enum(PLAY_SIDES),
  comment: z
    .string()
    .max(255, "comment must be 255 characters or fewer")
    .trim()
    .transform((val) => (val === "" ? null : val))
    .nullish(),
});

const RandomSchema = BaseSchema.extend({
  optionType: z.literal("RANDOM"),
  laneText: LaneTextSchema,
});

const RRandomSchema = BaseSchema.extend({
  optionType: z.literal("R-RANDOM"),
  laneText: RRandomLaneTextSchema.optional(),
});

const OthersSchema = BaseSchema.safeExtend({
  optionType: z.enum(["REGULAR", "MIRROR", "S-RANDOM"]),
});

export const RecommendationSchema = z.discriminatedUnion("optionType", [RandomSchema, RRandomSchema, OthersSchema]);

export const RecommendationViewSchema = BaseSchema.extend({
  recommendationId: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  optionType: z.enum(OPTION_TYPES),
  laneText: LaneTextSchema.optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;
export type RecommendationView = z.infer<typeof RecommendationViewSchema>;
