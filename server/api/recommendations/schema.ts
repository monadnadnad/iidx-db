import { z } from "zod";

import { OPTION_TYPES, PLAY_SIDES } from "~~/shared/types";
import { isValidHaichi, toLaneText1P } from "~~/shared/utils/haichi";

// Source: https://iidx.org/compendium/random#r-random
export const RRANDOM_PATTERNS_1P = [
  "2345671",
  "3456712",
  "4567123",
  "5671234",
  "6712345",
  "7123456",
  "1765432",
  "2176543",
  "3217654",
  "4321765",
  "5432176",
  "6543217",
] as const;

const RRANDOM_PATTERN_SET = new Set<string>(RRANDOM_PATTERNS_1P);

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

const basePostSchema = z.object({
  chartId: chartIdSchema,
  playSide: playSideSchema,
  optionType: optionTypeSchema,
  laneText: laneTextSchema.optional(),
  comment: commentSchema,
});

export type RecommendationPostInput = z.infer<typeof basePostSchema> & {
  laneText1P?: string;
};

export const RecommendationPostSchema: z.ZodType<RecommendationPostInput> = basePostSchema
  .superRefine((value, ctx) => {
    const { optionType, laneText } = value;

    if (laneText === undefined) {
      if (optionType === "RANDOM") {
        ctx.addIssue({
          code: "custom",
          path: ["laneText"],
          message: "laneText is required for RANDOM",
        });
      }
      return;
    }

    if (optionType !== "RANDOM" && optionType !== "R-RANDOM") {
      ctx.addIssue({
        code: "custom",
        path: ["laneText"],
        message: "laneText is only allowed for RANDOM or R-RANDOM options.",
      });
      return;
    }

    let laneText1P: string;
    try {
      laneText1P = toLaneText1P(value.playSide, laneText);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        path: ["laneText"],
        message: (error as Error).message,
      });
      return;
    }

    if (optionType === "R-RANDOM" && !RRANDOM_PATTERN_SET.has(laneText1P)) {
      ctx.addIssue({
        code: "custom",
        path: ["laneText"],
        message: "laneText must match one of the defined R-RANDOM patterns.",
      });
      return;
    }

    if (optionType === "RANDOM" && !isValidHaichi(laneText1P)) {
      ctx.addIssue({
        code: "custom",
        path: ["laneText"],
        message: "laneText is not valid",
      });
      return;
    }

    Object.assign(value, { laneText1P });
  })
  .transform((value) => value as RecommendationPostInput);

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
  laneText1P: z.string().optional(),
});

export type RecommendationQueryParams = z.infer<typeof RecommendationQuerySchema>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;
