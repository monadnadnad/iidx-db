import type { ChartDiff, PlayMode } from "~~/shared/types";

type ChartSlugDefinition = {
  mode: PlayMode;
  diff: ChartDiff;
};

export const chartSlugMap = {
  spb: { mode: "SP", diff: "B" },
  spn: { mode: "SP", diff: "N" },
  sph: { mode: "SP", diff: "H" },
  spa: { mode: "SP", diff: "A" },
  spl: { mode: "SP", diff: "L" },
  dpn: { mode: "DP", diff: "N" },
  dph: { mode: "DP", diff: "H" },
  dpa: { mode: "DP", diff: "A" },
  dpl: { mode: "DP", diff: "L" },
} satisfies Record<string, ChartSlugDefinition>;

export type ChartSlug = keyof typeof chartSlugMap;

export const slugByModeDiff = Object.entries(chartSlugMap).reduce<Record<string, ChartSlug>>(
  (acc, [slug, { mode, diff }]) => {
    acc[`${mode}-${diff}`] = slug as ChartSlug;
    return acc;
  },
  {},
);

export const chartDiffLabels: Record<ChartDiff, string> = {
  B: "BEGINNER",
  N: "NORMAL",
  H: "HYPER",
  A: "ANOTHER",
  L: "LEGGENDARIA",
};
