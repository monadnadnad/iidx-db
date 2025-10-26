import { describe, expect, it } from "vitest";

import { resolveLaneText1P } from "~~/server/domain/recommendations";

describe("resolveLaneText1P", () => {
  it("requires lane text for RANDOM", () => {
    expect(() => resolveLaneText1P("1P", "RANDOM", undefined)).toThrow(/laneText is required/);
  });

  it("validates R-RANDOM patterns", () => {
    expect(() => resolveLaneText1P("1P", "R-RANDOM", "1234567")).toThrow(/must match/);
  });

  it("rejects lane text for unsupported option types", () => {
    expect(() => resolveLaneText1P("1P", "REGULAR", "1234567")).toThrow(/laneText is only allowed/);
  });

  it("succeeds for valid RANDOM lane text", () => {
    const laneText = "1234567";
    const result = resolveLaneText1P("1P", "RANDOM", laneText);
    expect(result).toBe(laneText);
  });

  it("succeeds for valid R-RANDOM lane text", () => {
    const result = resolveLaneText1P("2P", "R-RANDOM", "5432176");
    expect(result).toBe("6712345");
  });
});
