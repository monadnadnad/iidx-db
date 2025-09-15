<template>
  <div v-if="song">
    <h1>{{ song.title }}</h1>
    <p>BPM: {{ song.bpm_min }} - {{ song.bpm_max }}</p>

    <h2>Charts</h2>
    <table border="1">
      <thead>
        <tr>
          <th>Mode</th>
          <th>Difficulty</th>
          <th>Level</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="chart in song.charts" :key="chart.id">
          <td>{{ chart.mode }}</td>
          <td>{{ chart.diff }}</td>
          <td>{{ chart.level }}</td>
          <td>{{ chart.notes }}</td>
        </tr>
      </tbody>
    </table>
    <br />
    <NuxtLink to="/songs">Back to Songs</NuxtLink>
  </div>
  <div v-else>
    <p>Loading song...</p>
  </div>
</template>

<script setup lang="ts">
interface Chart {
  id: number;
  mode: "SP" | "DP";
  diff: "B" | "N" | "H" | "A" | "L";
  level: number;
  notes: number;
}

interface Song {
  id: number;
  title: string;
  textage_tag: string;
  bpm_min: number;
  bpm_max: number;
  charts: Chart[];
}

const route = useRoute();
const id = route.params.id;

const { data: song } = await useFetch<Song>(`/api/songs/${id}`);
</script>
