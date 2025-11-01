import type { ChartDiff, PlayMode } from "~~/shared/types";

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
} as const;

export type ChartSlug = keyof typeof chartSlugMap;

export const getChartSlug = (mode: PlayMode, diff: ChartDiff): ChartSlug | undefined => {
  const slug = (mode + diff).toLowerCase();
  if (slug in chartSlugMap) {
    return slug as ChartSlug;
  }
  return undefined;
};

export const chartDiffLabels: Record<ChartDiff, string> = {
  B: "BEGINNER",
  N: "NORMAL",
  H: "HYPER",
  A: "ANOTHER",
  L: "LEGGENDARIA",
};
