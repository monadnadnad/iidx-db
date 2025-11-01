import { describe, expect, it } from "vitest";

import { isValidLaneText } from "~~/shared/utils/laneText";

describe("isValidLaneText", () => {
  it("accepts 7 unique digits", () => {
    expect(isValidLaneText("2345671")).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidLaneText("1")).toBe(false);
    expect(isValidLaneText("12345678")).toBe(false);
  });

  it("rejects when digits repeat", () => {
    expect(isValidLaneText("2234567")).toBe(false);
  });

  it("rejects inputs with non-digit characters", () => {
    expect(isValidLaneText("23a5671")).toBe(false);
  });
});
