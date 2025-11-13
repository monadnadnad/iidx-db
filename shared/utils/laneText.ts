import { z } from "zod";

// Source: https://iidx.org/compendium/random#r-random
export const RRANDOM_PATTERNS = [
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

export const isValidLaneText = (value: string): value is LaneText => {
  if (value.length !== 7) return false;
  return value.split("").sort().join("") === "1234567";
};
export const LaneTextSchema = z.string().refine(isValidLaneText, { message: "Invalid lane text" });
export type LaneText = z.infer<typeof LaneTextSchema>;

export const isValidRRANDOMLaneText = (value: string): value is LaneText => {
  const patterns = new Set<string>(RRANDOM_PATTERNS);
  return patterns.has(value);
};
export const RRandomLaneTextSchema = LaneTextSchema.refine(isValidRRANDOMLaneText, {
  message: "Invalid R-RANDOM lane text",
});

export function mirror(laneText: LaneText): LaneText {
  return laneText.split("").reverse().join("") as LaneText;
}
