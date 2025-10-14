<template>
  <div>
    <p v-if="error">{{ error.message }}</p>
    <p v-else-if="pending">Loading chart...</p>
    <p v-else-if="!chartData">Chart data is missing.</p>
    <div v-else>
      <h1>{{ chartData.song.title }}</h1>
      <ul class="chart-meta">
        <li>{{ chartData.chart.play_mode }}</li>
        <li>{{ chartDiffLabels[chartData.chart.diff] }}</li>
        <li>BPM {{ chartData.song.bpm_min }}-{{ chartData.song.bpm_max }}</li>
        <li v-if="chartData.chart.level">Lv{{ chartData.chart.level }}</li>
        <li v-if="chartData.chart.notes">{{ chartData.chart.notes }} notes</li>
      </ul>

      <section>
        <h2>Option Posts</h2>
        <form @submit.prevent="submitOptionPost">
          <select v-model="optionType">
            <option v-for="type in optionTypes" :key="type" :value="type">{{ type }}</option>
          </select>
          <input v-model="optionComment" type="text" maxlength="255" placeholder="Leave a short memo" />
          <button type="submit" :disabled="isSubmittingOption">Post</button>
          <span v-if="optionError" class="error">{{ optionError }}</span>
        </form>
        <ul>
          <li v-for="post in chartData.optionPosts" :key="post.id">
            <strong>{{ post.option_type }}</strong>
            <span v-if="post.comment">{{ post.comment }}</span>
            <small>{{ formatDate(post.created_at) }}</small>
          </li>
          <li v-if="chartData.optionPosts.length === 0">No posts yet.</li>
        </ul>
      </section>

      <section>
        <h2>Haichi Posts</h2>
        <form @submit.prevent="submitHaichiPost">
          <input v-model="haichiText" type="text" inputmode="numeric" maxlength="7" placeholder="1234567" required />
          <input v-model="haichiComment" type="text" maxlength="255" placeholder="Memo (optional)" />
          <button type="submit" :disabled="isSubmittingHaichi">Post</button>
          <span v-if="haichiError" class="error">{{ haichiError }}</span>
        </form>
        <ul>
          <li v-for="post in chartData.haichiPosts" :key="post.id">
            <strong>{{ post.lane_text }}</strong>
            <span v-if="post.comment">{{ post.comment }}</span>
            <small>{{ formatDate(post.created_at) }}</small>
          </li>
          <li v-if="chartData.haichiPosts.length === 0">No posts yet.</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Constants } from "~~/types/database.types";
import { chartDiffLabels } from "~~/shared/utils/chartSlug";
import { isValidHaichi } from "~~/shared/utils/haichi";

const optionTypes = Constants.public.Enums.option_type;
type OptionType = (typeof optionTypes)[number];

const { songId, chartSlug } = useRoute().params;

const { data: chartData, error, pending, refresh } = await useFetch(() => `/api/songs/${songId}/${chartSlug}`);

const optionType = ref<OptionType>(optionTypes[0] ?? "REGULAR");
const optionComment = ref("");
const optionError = ref<string | null>(null);
const isSubmittingOption = ref(false);

const haichiText = ref("");
const haichiComment = ref("");
const haichiError = ref<string | null>(null);
const isSubmittingHaichi = ref(false);

const formatDate = (value: string) => new Date(value).toLocaleString();

const submitOptionPost = async () => {
  if (!chartData.value) return;

  optionError.value = null;
  isSubmittingOption.value = true;
  try {
    await $fetch("/api/posts/option", {
      method: "POST",
      body: {
        chart_id: chartData.value.chart.id,
        option_type: optionType.value,
        comment: optionComment.value.trim() || null,
      },
    });
    optionComment.value = "";
    await refresh();
  } catch (err) {
    optionError.value = err instanceof Error ? err.message : "Failed to post";
  } finally {
    isSubmittingOption.value = false;
  }
};

const submitHaichiPost = async () => {
  if (!chartData.value) return;

  haichiError.value = null;

  const text = haichiText.value.trim();
  if (!isValidHaichi(text)) {
    haichiError.value = "配置が正しくない";
    return;
  }

  isSubmittingHaichi.value = true;
  try {
    await $fetch("/api/posts/haichi", {
      method: "POST",
      body: {
        chart_id: chartData.value.chart.id,
        lane_text: text,
        comment: haichiComment.value.trim() || null,
      },
    });
    haichiText.value = "";
    haichiComment.value = "";
    await refresh();
  } catch (err) {
    haichiError.value = err instanceof Error ? err.message : "Failed to post";
  } finally {
    isSubmittingHaichi.value = false;
  }
};
</script>
