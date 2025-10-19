<template>
  <div>
    <p v-if="error">{{ error.message }}</p>
    <p v-else-if="pending">Loading...</p>
    <div v-else>
      <h1 data-test="song-title">{{ chartData.song.title }}</h1>
      <form data-test="recommendation-form" @submit.prevent="submitRecommendation">
        <select v-model="recommendationForm.playSide">
          <option v-for="side in playSides" :key="side" :value="side">{{ side }}</option>
        </select>
        <select v-model="recommendationForm.optionType">
          <option v-for="type in optionTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <input v-if="canInputLaneText" v-model="recommendationForm.laneText" maxlength="7" placeholder="lane" />
        <input v-model="recommendationForm.comment" maxlength="255" placeholder="comment" />
        <button type="submit" :disabled="isSubmittingRecommendation">Send</button>
        <span v-if="recommendationError" class="error">{{ recommendationError }}</span>
      </form>
      <ul data-test="recommendation-list">
        <li v-for="item in recommendations" :key="item.id">
          {{ item.playSide }} / {{ item.optionType }} /
          <span v-if="item.laneText1P">{{ fromLaneText1P(item.playSide, item.laneText1P) }} /</span>
          <span v-if="item.comment">{{ item.comment }} /</span>
          {{ item.createdAt }}
        </li>
        <li v-if="recommendations.length === 0">No recommendations</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";

import { fromLaneText1P } from "~~/shared/utils/haichi";
import { OPTION_TYPES, PLAY_SIDES, type OptionType, type PlaySide } from "~~/shared/types";
import { RecommendationPostSchema, type RecommendationResponse } from "~~/server/api/recommendations/schema";

type ChartPageData = {
  song: { title: string };
  chart: { id: number };
  recommendations: RecommendationResponse[];
};

const optionTypes = OPTION_TYPES;
const playSides = PLAY_SIDES;

const { songId, chartSlug } = useRoute().params;

const {
  data: chartDataRef,
  error,
  pending,
  refresh,
} = await useFetch<ChartPageData>(() => `/api/songs/${songId}/${chartSlug}`);

const chartData = computed(() => chartDataRef.value ?? { song: { title: "" }, chart: { id: 0 }, recommendations: [] });
const recommendations = computed(() => chartDataRef.value?.recommendations ?? []);

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

const recommendationError = ref<string | null>(null);
const isSubmittingRecommendation = ref(false);

watch(
  () => recommendationForm.optionType,
  () => {
    if (!canInputLaneText.value) {
      recommendationForm.laneText = "";
    }
  },
);

const submitRecommendation = async () => {
  if (!chartDataRef.value) return;

  recommendationError.value = null;

  const laneText = recommendationForm.laneText.trim();

  const parsed = RecommendationPostSchema.safeParse({
    chartId: chartDataRef.value.chart.id,
    playSide: recommendationForm.playSide,
    optionType: recommendationForm.optionType,
    laneText: laneText.length > 0 ? laneText : undefined,
    comment: recommendationForm.comment.trim(),
  });
  if (!parsed.success) {
    recommendationError.value = parsed.error.issues[0]!.message;
    return;
  }

  isSubmittingRecommendation.value = true;
  try {
    await $fetch("/api/recommendations", {
      method: "POST",
      body: parsed.data,
    });
    recommendationForm.laneText = "";
    recommendationForm.comment = "";
    await refresh();
  } catch (err) {
    recommendationError.value = err instanceof Error ? err.message : "Failed";
  } finally {
    isSubmittingRecommendation.value = false;
  }
};
</script>
