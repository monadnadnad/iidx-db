<template>
  <div>
    <div v-if="error">Failed to load: {{ error.message }}</div>
    <div v-else-if="!chartData">No chart data was found.</div>
    <div v-else>
      <h1>{{ chartData.song.title }}</h1>
      <p>
        {{ chartLabel }} / BPM {{ chartData.song.bpm_min }} - {{ chartData.song.bpm_max }}
        <span v-if="chartData.chart.level"> / Lv.{{ chartData.chart.level }}</span>
        <span v-if="chartData.chart.notes"> / {{ chartData.chart.notes }} notes</span>
      </p>

      <section>
        <h2>Recommended Options</h2>
        <ul>
          <li v-for="summary in chartData.optionVotes" :key="summary.option_type">
            {{ optionLabels[summary.option_type] }}: {{ summary.vote_count }}
            <button type="button" @click="vote(summary.option_type)">Vote</button>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from "~~/types/schema";
import { chartDiffLabels, type ChartSlug } from "~~/shared/utils/chartSlug";

type OptionType = Database["public"]["Enums"]["option_type"];
type SongRow = Database["public"]["Tables"]["songs"]["Row"];
type ChartRow = Database["public"]["Tables"]["charts"]["Row"];

type OptionVote = {
  chart_id: ChartRow["id"];
  option_type: OptionType;
  vote_count: number;
};

type ChartPageData = {
  song: Pick<SongRow, "id" | "title" | "bpm_min" | "bpm_max" | "textage_tag">;
  chart: Pick<ChartRow, "id" | "song_id" | "play_mode" | "diff" | "level" | "notes"> & { slug: ChartSlug };
  optionVotes: OptionVote[];
};

const route = useRoute();
const songId = route.params.songId as string;
const chartSlug = route.params.chartSlug as string;

const { data, error, refresh } = await useFetch<ChartPageData>(() => `/api/songs/${songId}/${chartSlug}`, {
  key: `song-${songId}-${chartSlug}`,
});

const chartData = computed(() => data.value ?? null);
const chartLabel = computed(() => {
  if (!chartData.value) return "";
  return `${chartData.value.chart.play_mode} ${chartDiffLabels[chartData.value.chart.diff]}`;
});

const optionLabels: Record<OptionType, string> = {
  REGULAR: "REGULAR",
  MIRROR: "MIRROR",
  RANDOM: "RANDOM",
  "R-RANDOM": "R-RANDOM",
  "S-RANDOM": "S-RANDOM",
};

const vote = async (optionType: OptionType) => {
  if (!chartData.value) return;
  await $fetch("/api/option-votes", {
    method: "POST",
    body: {
      chart_id: chartData.value.chart.id,
      option_type: optionType,
    },
  });
  await refresh();
};
</script>
