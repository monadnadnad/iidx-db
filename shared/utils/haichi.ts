export const isValidHaichi = (value: string) => {
  if (value.length !== 7) return false;
  return value.split("").sort().join("") === "1234567";
};
