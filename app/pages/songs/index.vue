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
import { chartDiffLabels } from "~~/shared/utils/chartSlug";

const { data, error } = await useFetch("/api/songs");

const songs = computed(() => data.value ?? null);
</script>
