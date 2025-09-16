<template>
  <div v-if="song">
    <h1>{{ song.title }}</h1>
    <p>BPM: {{ song.bpm_min }} - {{ song.bpm_max }}</p>

    <h2>Charts</h2>
    <div
      v-for="chart in song.charts"
      :key="chart.id"
      style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px"
    >
      <h3>{{ chart.play_mode }} / {{ chart.diff }} / Level {{ chart.level }}</h3>

      <h4>Recommended Options</h4>
      <ul>
        <li v-for="option in availableOptions" :key="option">
          {{ option }}: <strong>{{ getVoteCount(chart.id, option) }}</strong> votes
          <button @click="vote(chart.id, option)" style="margin-left: 10px">Vote for {{ option }}</button>
        </li>
      </ul>
    </div>

    <br />
    <NuxtLink to="/songs">Back to Songs</NuxtLink>
  </div>
  <div v-else>
    <p>Loading song...</p>
  </div>
</template>

<script setup lang="ts">
import type { Database } from "../../../types/schema";

type Tables = Database["public"]["Tables"];
type Song = Tables["songs"]["Row"];
type Chart = Tables["charts"]["Row"];
type Vote = Tables["option_votes"]["Row"];
type OptionType = Tables["option_votes"]["Row"]["option_type"];
interface ChartWithVotes extends Chart {
  option_votes: Vote[];
}
interface SongWithChartsAndVotes extends Song {
  charts: ChartWithVotes[];
}

const route = useRoute();
const id = route.params.id;
const { data: song, refresh } = await useFetch<SongWithChartsAndVotes>(`/api/songs/${id}`);

const availableOptions: OptionType[] = ["REGULAR", "MIRROR", "RANDOM", "R-RANDOM", "S-RANDOM"];

const getVoteCount = (chartId: number, optionType: OptionType) => {
  const chart = song.value?.charts.find((c) => c.id === chartId);
  if (!chart) return 0;
  return chart.option_votes.filter((vote) => vote.option_type === optionType).length;
};

const vote = async (chartId: number, optionType: OptionType) => {
  try {
    await $fetch("/api/option-votes", {
      method: "POST",
      body: {
        chart_id: chartId,
        option_type: optionType,
      },
    });
    await refresh();
  } catch (e) {
    console.error(e);
    alert("Failed to vote.");
  }
};
</script>
