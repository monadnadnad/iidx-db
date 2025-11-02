<template>
  <div>
    <div v-if="isLocked">
      <p>開発中です</p>
    </div>
    <NuxtPage v-else />
  </div>
</template>

<script setup lang="ts">
const isLocked = !import.meta.dev;
</script>
