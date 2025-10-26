export const PLAY_SIDES = ["1P", "2P"] as const;
export type PlaySide = (typeof PLAY_SIDES)[number];

export const OPTION_TYPES = ["REGULAR", "MIRROR", "RANDOM", "R-RANDOM", "S-RANDOM"] as const;
export type OptionType = (typeof OPTION_TYPES)[number];

export const PLAY_MODES = ["SP", "DP"] as const;
export type PlayMode = (typeof PLAY_MODES)[number];

export const CHART_DIFFS = ["B", "N", "H", "A", "L"] as const;
export type ChartDiff = (typeof CHART_DIFFS)[number];
