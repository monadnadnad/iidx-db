<template>
  <div>
    <p v-if="chartError">{{ chartError.message }}</p>
    <p v-else-if="chartPending">Loading...</p>
    <div v-else>
      <h1 data-test="song-title">{{ chartData?.title }}</h1>
      <p v-if="chartData" class="chart-meta">
        Lv.{{ chartData.level }} / {{ chartData.notes }} notes / BPM {{ chartData.bpm_min
        }}<span v-if="chartData.bpm_min !== chartData.bpm_max">-{{ chartData.bpm_max }}</span>
      </p>

      <form data-test="recommendation-form" @submit.prevent="submitRecommendation">
        <select v-model="recommendationForm.playSide">
          <option v-for="side in PLAY_SIDES" :key="side" :value="side">{{ side }}</option>
        </select>
        <select v-model="recommendationForm.optionType">
          <option v-for="type in OPTION_TYPES" :key="type" :value="type">{{ type }}</option>
        </select>
        <input v-if="canInputLaneText" v-model="recommendationForm.laneText" maxlength="7" placeholder="lane" />
        <input v-model="recommendationForm.comment" maxlength="255" placeholder="comment" />
        <button type="submit" :disabled="formState.submitting">Send</button>
        <span v-if="formState.formError" class="error">
          {{ formState.formError }}
        </span>
      </form>

      <p v-if="recommendationsError" class="error">
        {{ recommendationsError.message }}
      </p>

      <ul data-test="recommendation-list">
        <li v-for="item in recommendationsData || []" :key="item.recommendationId">
          {{ item.playSide }} / {{ item.optionType }} /
          <span v-if="item.laneText">{{ item.laneText }} /</span>
          <span v-if="item.comment">{{ item.comment }} /</span>
          {{ item.createdAt }}
        </li>
        <li v-if="!recommendationsPending && (!recommendationsData || recommendationsData.length === 0)">
          No recommendations
        </li>
        <li v-if="recommendationsPending">Loading recommendations...</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RecommendationSchema, type RecommendationView } from "~~/server/domain/recommendation/model";

const route = useRoute();
const songId = computed(() => Number(route.params.songId));
const chartSlug = computed(() => String(route.params.chartSlug));

const {
  data: chartData,
  error: chartError,
  pending: chartPending,
} = await useFetch(() => `/api/songs/${songId.value}/${chartSlug.value}`);

const chartId = computed(() => chartData.value?.id ?? null);

const {
  data: recommendationsData,
  pending: recommendationsPending,
  error: recommendationsError,
  refresh: refreshRecommendations,
} = await useAsyncData<RecommendationView[]>(
  "recommendations-" + chartId.value,
  async () => {
    if (!chartId.value) {
      return [];
    }

    return await $fetch<RecommendationView[]>("/api/recommendations", {
      query: { chartId: chartId.value },
    });
  },
  {
    watch: [chartId],
  },
);

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

const formState = reactive({
  submitting: false,
  formError: null as string | null,
});

const canInputLaneText = computed(() => ["RANDOM", "R-RANDOM"].includes(recommendationForm.optionType));

watch(
  () => recommendationForm.optionType,
  () => {
    if (!canInputLaneText.value) {
      recommendationForm.laneText = "";
    }
  },
);

const submitRecommendation = async () => {
  if (!chartId.value || formState.submitting) return;

  formState.formError = null;

  const laneText = recommendationForm.laneText.trim();
  const comment = recommendationForm.comment.trim();

  const parsed = RecommendationSchema.safeParse({
    chartId: chartId.value,
    playSide: recommendationForm.playSide,
    optionType: recommendationForm.optionType,
    laneText: laneText.length > 0 ? laneText : undefined,
    comment,
  });

  if (!parsed.success) {
    formState.formError = parsed.error.message;

    return;
  }

  formState.submitting = true;
  try {
    await $fetch("/api/recommendations", {
      method: "POST",
      body: parsed.data,
    });
    recommendationForm.laneText = "";
    recommendationForm.comment = "";
    await refreshRecommendations();
  } catch (err) {
    formState.formError = err instanceof Error ? err.message : "Failed";
  } finally {
    formState.submitting = false;
  }
};
</script>
