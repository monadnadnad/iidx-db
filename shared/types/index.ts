export const PLAY_SIDES = ["1P", "2P"] as const;
export type PlaySide = (typeof PLAY_SIDES)[number];

export const OPTION_TYPES = ["REGULAR", "MIRROR", "RANDOM", "R-RANDOM", "S-RANDOM"] as const;
export type OptionType = (typeof OPTION_TYPES)[number];
