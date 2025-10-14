<template>
  <div>
    <div v-if="error">Failed to load: {{ error.message }}</div>
    <ul v-else>
      <li v-for="song in songs" :key="song.id">
        <div>{{ song.title }}</div>
        <ul>
          <li v-for="chart in song.charts" :key="chart.id">
            <NuxtLink :to="`/songs/${song.id}/${chart.slug}`">
              {{ chart.play_mode }} {{ chartDiffLabels[chart.diff] }}
            </NuxtLink>
            <span v-if="song.bpm_min == song.bpm_max"> / BPM {{ song.bpm_min }} </span>
            <span v-else> / BPM {{ song.bpm_min }} - {{ song.bpm_max }} </span>
            <span v-if="chart.level"> / Lv.{{ chart.level }}</span>
            <span v-if="chart.notes"> / {{ chart.notes }} notes</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Database } from "~~/types/database.types";
import { chartDiffLabels, slugByModeDiff, type ChartSlug } from "~~/shared/utils/chartSlug";

type SongRow = Database["public"]["Tables"]["songs"]["Row"];
type ChartRow = Database["public"]["Tables"]["charts"]["Row"];
type ChartRowApiResponse = Pick<ChartRow, "id" | "play_mode" | "diff" | "level" | "notes">;
type ChartWithSlug = ChartRowApiResponse & { slug: ChartSlug };
type ApiResponse = SongRow & {
  charts: Array<ChartRowApiResponse>;
};
type SongSummary = SongRow & {
  charts: Array<ChartWithSlug>;
};

const { data, error } = await useFetch<ApiResponse[]>("/api/songs");

const songs = computed<SongSummary[] | null>(() => {
  if (!data.value) return null;

  return data.value.map((song) => {
    const charts = song.charts
      .map((chart) => {
        const slug = slugByModeDiff[`${chart.play_mode}-${chart.diff}`];
        if (!slug) return null;
        return { ...chart, slug };
      })
      .filter((chart): chart is ChartWithSlug => chart !== null);

    return { ...song, charts };
  });
});
</script>
