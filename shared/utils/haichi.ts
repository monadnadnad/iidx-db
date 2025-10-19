import type { PlaySide } from "../types";

export const isValidHaichi = (value: string) => {
  if (value.length !== 7) return false;
  return value.split("").sort().join("") === "1234567";
};

export const toLaneText1P = (playSide: PlaySide, laneText: string): string => {
  const trimmed = laneText.trim();
  if (!isValidHaichi(trimmed)) {
    throw new Error("laneText must be 7 unique digits");
  }
  return playSide === "1P" ? trimmed : trimmed.split("").reverse().join("");
};

export const fromLaneText1P = (playSide: PlaySide, laneText1P: string): string => {
  const trimmed = laneText1P.trim();
  if (!isValidHaichi(trimmed)) {
    throw new Error("laneText1P must be 7 unique digits");
  }
  return playSide === "1P" ? trimmed : trimmed.split("").reverse().join("");
};
