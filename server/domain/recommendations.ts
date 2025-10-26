import type { OptionType, PlaySide } from "~~/shared/types";
import { toLaneText1P } from "~~/shared/utils/haichi";

// Source: https://iidx.org/compendium/random#r-random
const RRANDOM_PATTERNS_1P = [
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

export class LaneTextValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LaneTextValidationError";
  }
}

export const resolveLaneText1P = (
  playSide: PlaySide,
  optionType: OptionType,
  laneText?: string,
): string | undefined => {
  const toLaneTextOrThrow = (value: string) => {
    try {
      return toLaneText1P(playSide, value);
    } catch (error) {
      throw new LaneTextValidationError((error as Error).message);
    }
  };

  if (optionType === "RANDOM") {
    if (!laneText) {
      throw new LaneTextValidationError("laneText is required for RANDOM");
    }

    return toLaneTextOrThrow(laneText);
  }

  if (optionType === "R-RANDOM") {
    if (!laneText) {
      return undefined;
    }

    const laneText1P = toLaneTextOrThrow(laneText);

    if (!RRANDOM_PATTERN_SET.has(laneText1P)) {
      throw new LaneTextValidationError("laneText must match one of the defined R-RANDOM patterns.");
    }

    return laneText1P;
  }

  if (laneText) {
    throw new LaneTextValidationError("laneText is only allowed for RANDOM or R-RANDOM options.");
  }

  return undefined;
};
