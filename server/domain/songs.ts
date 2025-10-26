import type { ChartDiff, PlayMode } from "~~/shared/types";
import { chartSlugMap, type ChartSlug } from "~~/shared/utils/chartSlug";

export class SongNotFoundError extends Error {
  constructor(message = "Song not found") {
    super(message);
    this.name = "SongNotFoundError";
  }
}

export class ChartNotFoundError extends Error {
  constructor(message = "Chart not found") {
    super(message);
    this.name = "ChartNotFoundError";
  }
}

export class UnknownChartSlugError extends Error {
  constructor(message = "Chart slug not recognized") {
    super(message);
    this.name = "UnknownChartSlugError";
  }
}

export type ChartSlugResolution = {
  slug: ChartSlug;
  playMode: PlayMode;
  diff: ChartDiff;
};

export const resolveChartSlug = (slug: string): ChartSlugResolution => {
  const normalized = slug.toLowerCase();
  const definition = chartSlugMap[normalized as ChartSlug];

  if (!definition) {
    throw new UnknownChartSlugError();
  }

  return {
    slug: normalized as ChartSlug,
    playMode: definition.mode,
    diff: definition.diff,
  };
};
