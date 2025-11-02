import { z } from "zod";

import { PLAY_SIDES } from "~~/shared/types";
import { mirror } from "~~/shared/utils/laneText";

import { LaneTextSchema, RRandomLaneTextSchema } from "../laneText";
import { RecommendationCommentSchema } from "./comment";

const BaseSchema = z.strictObject({
  chartId: z.number().int().positive(),
  playSide: z.enum(PLAY_SIDES),
  comment: RecommendationCommentSchema.optional(),
});

const RandomSchema = BaseSchema.safeExtend({
  optionType: z.literal("RANDOM"),
  laneText: LaneTextSchema,
});

const RRandomSchema = BaseSchema.safeExtend({
  optionType: z.literal("R-RANDOM"),
  laneText: RRandomLaneTextSchema.optional(),
});

const OthersSchema = BaseSchema.safeExtend({
  optionType: z.enum(["REGULAR", "MIRROR", "S-RANDOM"]),
});

export const RecommendationSchema = z
  .discriminatedUnion("optionType", [RandomSchema, RRandomSchema, OthersSchema])
  .transform((value) => {
    const laneText = "laneText" in value ? value.laneText : undefined;
    const laneText1P =
      laneText !== undefined && value.playSide === "2P" ? LaneTextSchema.parse(mirror(laneText)) : laneText;

    return {
      chartId: value.chartId,
      playSide: value.playSide,
      optionType: value.optionType,
      comment: value.comment,
      laneText,
      laneText1P,
    };
  });

export type Recommendation = z.infer<typeof RecommendationSchema>;
