<template>
  <div>
    <h1>Songs</h1>
    <p v-if="pending">Loading...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <ul v-else-if="songs && songs.length">
      <li v-for="song in songs" :key="song.id">
        <NuxtLink :to="`/songs/${song.id}`">{{ song.title }}</NuxtLink>
      </li>
    </ul>
    <p v-else>No songs found.</p>
  </div>
</template>

<script setup lang="ts">
interface Song {
  id: number;
  title: string;
  textage_tag: string;
  bpm_min: number;
  bpm_max: number;
}
const { data: songs, pending, error } = await useFetch<Song[]>("/api/songs");
</script>
