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

export const isValidLaneText = (value: string) => {
  if (value.length !== 7) return false;
  return value.split("").sort().join("") === "1234567";
};

export const isValidRRANDOMLaneText = (value: string) => {
  const patterns = new Set<string>(RRANDOM_PATTERNS);
  return patterns.has(value);
};

export const mirror = (laneText: string): string => laneText.split("").reverse().join("");
