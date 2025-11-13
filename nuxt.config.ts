// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxtjs/supabase", "@nuxt/test-utils/module", "@nuxt/eslint"],
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
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
