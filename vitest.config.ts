import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.test.ts"],
          environment: "happy-dom",
        },
        resolve: {
          alias: {
            "~~": path.resolve(__dirname, "./"),
          },
        },
      },
    ],
  },
});
