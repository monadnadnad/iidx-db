<template>
  <div>
    <p v-if="error">{{ error.message }}</p>
    <p v-else-if="pending">Loading...</p>
    <div v-else>
      <h1 data-test="song-title">{{ chartData?.title }}</h1>
      <p v-if="chartData" class="chart-meta">
        Lv.{{ chartData.level }} / {{ chartData.notes }} notes / BPM {{ chartData.bpm_min
        }}<span v-if="chartData.bpm_min !== chartData.bpm_max">-{{ chartData.bpm_max }}</span>
      </p>
      <form data-test="recommendation-form" @submit.prevent="submitRecommendation">
        <select v-model="recommendationForm.playSide">
          <option v-for="side in playSides" :key="side" :value="side">{{ side }}</option>
        </select>
        <select v-model="recommendationForm.optionType">
          <option v-for="type in optionTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <input v-if="canInputLaneText" v-model="recommendationForm.laneText" maxlength="7" placeholder="lane" />
        <input v-model="recommendationForm.comment" maxlength="255" placeholder="comment" />
        <button type="submit" :disabled="recommendationsState.submitting">Send</button>
        <span v-if="recommendationsState.formError" class="error">{{ recommendationsState.formError }}</span>
      </form>
      <p v-if="recommendationsState.error" class="error">{{ recommendationsState.error }}</p>
      <ul data-test="recommendation-list">
        <li v-for="item in recommendationsState.items" :key="item.id">
          {{ item.playSide }} / {{ item.optionType }} /
          <span v-if="item.laneText1P">{{ item.playSide === "2P" ? mirror(item.laneText1P) : item.laneText1P }} /</span>
          <span v-if="item.comment">{{ item.comment }} /</span>
          {{ item.createdAt }}
        </li>
        <li v-if="!recommendationsState.pending && recommendationsState.items.length === 0">No recommendations</li>
        <li v-if="recommendationsState.pending">Loading recommendations...</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";

import { mirror } from "~~/shared/utils/laneText";
import { OPTION_TYPES, PLAY_SIDES, type OptionType, type PlaySide } from "~~/shared/types";
import {
  CreateRecommendationRequestSchema,
  type RecommendationResponse,
} from "~~/server/application/recommendations/schema";

const optionTypes = OPTION_TYPES;
const playSides = PLAY_SIDES;

const route = useRoute();
const songId = computed(() => Number(route.params.songId));
const chartSlug = computed(() => String(route.params.chartSlug));

const { data: chartData, error, pending } = await useFetch(() => `/api/songs/${songId.value}/${chartSlug.value}`);

const recommendationsState = reactive({
  items: [] as RecommendationResponse[],
  pending: false,
  error: null as string | null,
  formError: null as string | null,
  submitting: false,
});

const recommendationForm = reactive<{
  playSide: PlaySide;
  optionType: OptionType;
  laneText: string;
  comment: string;
}>({
  playSide: "1P",
  optionType: "RANDOM",
  laneText: "",
  comment: "",
});

const canInputLaneText = computed(() => ["RANDOM", "R-RANDOM"].includes(recommendationForm.optionType));

const chartId = computed(() => chartData.value?.id ?? null);

const loadRecommendations = async () => {
  if (!chartId.value) return;

  recommendationsState.pending = true;
  recommendationsState.error = null;
  try {
    recommendationsState.items = await $fetch<RecommendationResponse[]>("/api/recommendations", {
      query: { chartId: chartId.value },
    });
  } catch (err) {
    recommendationsState.error = err instanceof Error ? err.message : "Failed to fetch recommendations";
  } finally {
    recommendationsState.pending = false;
  }
};

watch(
  chartId,
  async (id) => {
    if (!id) return;
    await loadRecommendations();
  },
  { immediate: true },
);

watch(
  () => recommendationForm.optionType,
  () => {
    if (!canInputLaneText.value) {
      recommendationForm.laneText = "";
    }
  },
);

const submitRecommendation = async () => {
  if (!chartId.value || recommendationsState.submitting) return;

  recommendationsState.formError = null;

  const laneText = recommendationForm.laneText.trim();

  const parsed = CreateRecommendationRequestSchema.safeParse({
    chartId: chartId.value,
    playSide: recommendationForm.playSide,
    optionType: recommendationForm.optionType,
    laneText: laneText.length > 0 ? laneText : undefined,
    comment: recommendationForm.comment.trim(),
  });
  if (!parsed.success) {
    recommendationsState.formError = parsed.error.issues[0]!.message;
    return;
  }

  recommendationsState.submitting = true;
  try {
    await $fetch("/api/recommendations", {
      method: "POST",
      body: parsed.data,
    });
    recommendationForm.laneText = "";
    recommendationForm.comment = "";
    await loadRecommendations();
  } catch (err) {
    recommendationsState.formError = err instanceof Error ? err.message : "Failed";
  } finally {
    recommendationsState.submitting = false;
  }
};
</script>
