import { describe, expect, it } from "vitest";

import { UnknownChartSlugError, resolveChartSlug } from "~~/server/domain/songs";

describe("resolveChartSlug", () => {
  it("normalizes slug case and returns corresponding mode/diff", () => {
    const result = resolveChartSlug("SpA");

    expect(result).toEqual({
      slug: "spa",
      playMode: "SP",
      diff: "A",
    });
  });

  it("throws UnknownChartSlugError for unsupported slugs", () => {
    expect(() => resolveChartSlug("foo")).toThrow(UnknownChartSlugError);
  });
});
