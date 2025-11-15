import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./supabase/schema.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  migrations: {
    prefix: "supabase",
  },
  schemaFilter: ["public"],
  casing: "snake_case",
  dbCredentials: {
    // @ts-expect-error node type not recognized
    url: process.env.DATABASE_URL!,
  },
});
