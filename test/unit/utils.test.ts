import { describe, expect, it } from "vitest";

import { toLaneText1P, fromLaneText1P } from "~~/shared/utils/haichi";

describe("toLaneText1P", () => {
  it("returns the original text for 1P", () => {
    expect(toLaneText1P("1P", "2345671")).toBe("2345671");
  });

  it("mirrors digits for 2P inputs", () => {
    expect(toLaneText1P("2P", "2345671")).toBe("1765432");
  });

  it("throws for non-numeric input", () => {
    expect(() => toLaneText1P("1P", "23a5671")).toThrow(/laneText must be 7 unique digits/);
  });
});

describe("fromLaneText1P", () => {
  it("returns the original text for 1P", () => {
    expect(fromLaneText1P("1P", "2345671")).toBe("2345671");
  });

  it("mirrors digits for 2P inputs", () => {
    expect(fromLaneText1P("2P", "2345671")).toBe("1765432");
  });

  it("throws for invalid lane text", () => {
    expect(() => fromLaneText1P("1P", "12345")).toThrow(/laneText1P must be 7 unique digits/);
  });
});
