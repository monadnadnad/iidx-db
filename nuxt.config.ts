// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxt/test-utils/module", "@nuxt/eslint", "shadcn-nuxt"],
  devtools: { enabled: true },
  css: ["@/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  vite: {
    plugins: [tailwindcss()],
  },
  eslint: {
    config: {
      stylistic: {
        quotes: "double",
        semi: true,
      },
    },
  },
  supabase: {
    types: "~~/types/database.types.ts",
    redirect: false,
  },
});
