import { z } from "zod";

import { isValidLaneText, isValidRRANDOMLaneText } from "~~/shared/utils/laneText";

export const LaneTextSchema = z.string().refine(isValidLaneText, { message: "Invalid lane text" }).brand<"LaneText">();
export type LaneText = z.infer<typeof LaneTextSchema>;

export const RRandomLaneTextSchema = z
  .string()
  .refine(isValidRRANDOMLaneText, { message: "Invalid R-RANDOM lane text" })
  .brand<"RRandomLaneText">();
export type RRandomLaneText = z.infer<typeof RRandomLaneTextSchema>;
