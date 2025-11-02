import { z } from "zod";

export const RecommendationCommentSchema = z
  .string()
  .trim()
  .max(255, "comment must be 255 characters or fewer")
  .optional()
  .brand<"RecommendationComment">();
export type RecommendationComment = z.infer<typeof RecommendationCommentSchema>;
