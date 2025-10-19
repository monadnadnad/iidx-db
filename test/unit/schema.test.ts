import { describe, expect, it } from "vitest";

import {
  RecommendationPostSchema,
  RecommendationQuerySchema,
  RecommendationResponseSchema,
} from "~~/server/api/recommendations/schema";

const makeValidPostInput = () => ({
  chartId: "42",
  playSide: "1P" as const,
  optionType: "REGULAR" as const,
  comment: "test",
});

describe("RecommendationPostSchema", () => {
  it("accepts a REGULAR post without lane text", () => {
    const parsed = RecommendationPostSchema.parse(makeValidPostInput());

    expect(parsed.laneText).toBeUndefined();
    expect(parsed.laneText1P).toBeUndefined();
    expect(parsed.comment).toBe("test");
  });

  it("normalises whitespace and turns empty comments into null", () => {
    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      comment: "   ",
    });

    expect(parsed.comment).toBeNull();
  });

  it("rejects laneText for non random options", () => {
    expect(() =>
      RecommendationPostSchema.parse({
        ...makeValidPostInput(),
        laneText: "1234567",
      }),
    ).toThrow(/laneText is only allowed for RANDOM/);
  });

  it("accepts a valid R-RANDOM pattern", () => {
    const pattern = "7123456";

    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      optionType: "R-RANDOM",
      laneText: pattern,
    });

    expect(parsed.laneText1P).toBe(pattern);
  });

  it("accepts a 2P R-RANDOM pattern by normalising to 1P", () => {
    const twoPPattern = "5432176";

    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      optionType: "R-RANDOM",
      playSide: "2P",
      laneText: twoPPattern,
    });

    expect(parsed.laneText1P).toBe("6712345");
  });

  it("rejects non unique RANDOM patterns", () => {
    expect(() =>
      RecommendationPostSchema.parse({
        ...makeValidPostInput(),
        optionType: "RANDOM",
        laneText: "1234566",
      }),
    ).toThrow(/laneText must be 7 unique digits/);
  });

  it("rejects RANDOM without laneText", () => {
    expect(() =>
      RecommendationPostSchema.parse({
        ...makeValidPostInput(),
        optionType: "RANDOM",
      }),
    ).toThrow(/laneText is required/);
  });
});

describe("RecommendationQuerySchema", () => {
  it("parses empty queries", () => {
    expect(RecommendationQuerySchema.parse({})).toEqual({
      playSide: "1P",
    });
  });

  it("rejects invalid laneText", () => {
    expect(() =>
      RecommendationQuerySchema.parse({
        chartId: "12",
        playSide: "2P",
        optionType: "RANDOM",
        laneText: "  2345671  ",
      }),
    ).toThrow();
  });

  it("rejects invalid option types", () => {
    expect(() =>
      RecommendationQuerySchema.parse({
        optionType: "INVALID",
      }),
    ).toThrow(/Invalid option/);
  });
});

describe("RecommendationResponseSchema", () => {
  it("returns parsed values with optional lane text", () => {
    const parsed = RecommendationResponseSchema.parse({
      id: 123,
      chartId: 10,
      playSide: "1P",
      optionType: "REGULAR",
      comment: "memo",
      createdAt: "2025-01-01T00:00:00.000Z",
    });

    expect(parsed).toMatchObject({
      id: 123,
      chartId: 10,
      playSide: "1P",
      optionType: "REGULAR",
      comment: "memo",
    });
  });
});
