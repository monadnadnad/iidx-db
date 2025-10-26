import { describe, expect, it } from "vitest";

import {
  RecommendationPostSchema,
  RecommendationQuerySchema,
  RecommendationResponseSchema,
} from "~~/server/application/recommendations/schema";

const makeValidPostInput = () => ({
  chartId: "42",
  playSide: "1P" as const,
  optionType: "REGULAR" as const,
  comment: "test",
});

describe("RecommendationPostSchema", () => {
  it("coerces chartId to a number and strips extra fields", () => {
    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      extra: "ignored",
    });

    expect(parsed.chartId).toBe(42);
    expect(parsed).not.toHaveProperty("extra");
  });

  it("normalises whitespace and turns empty comments into null", () => {
    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      comment: "   ",
    });

    expect(parsed.comment).toBeNull();
  });

  it("keeps optional lane text as provided", () => {
    const parsed = RecommendationPostSchema.parse({
      ...makeValidPostInput(),
      laneText: "1234567",
    });

    expect(parsed.laneText).toBe("1234567");
  });
});

describe("RecommendationQuerySchema", () => {
  it("parses empty query", () => {
    expect(RecommendationQuerySchema.parse({})).toEqual({
      playSide: "1P",
    });
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
      updatedAt: "2025-01-02T00:00:00.000Z",
    });

    expect(parsed).toMatchObject({
      id: 123,
      chartId: 10,
      playSide: "1P",
      optionType: "REGULAR",
      comment: "memo",
      updatedAt: "2025-01-02T00:00:00.000Z",
    });
  });
});
