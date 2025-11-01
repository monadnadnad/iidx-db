// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["@nuxtjs/supabase", "@nuxt/test-utils/module", "@nuxt/eslint"],
  supabase: {
    types: "~~/types/database.types.ts",
    redirect: false,
  },
  devtools: { enabled: true },
});
