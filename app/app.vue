<template>
  <div
    v-if="isLocked"
    class="min-h-screen bg-gray-100 flex items-center justify-center"
  >
    <h1 class="text-3xl text-center text-gray-800">
      開発中です
    </h1>
  </div>
  <NuxtPage v-else />
</template>

<script setup lang="ts">
const isLocked = !import.meta.dev;
</script>
