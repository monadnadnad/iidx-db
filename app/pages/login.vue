<template>
  <div class="login-page">
    <h1>Log In</h1>

    <section class="status">
      <p v-if="user">
        Signed in as {{ user.email ?? user.id }}
      </p>
      <p v-else>
        Not authenticated
      </p>
      <p
        v-if="authError"
        class="error"
      >
        {{ authError }}
      </p>
    </section>

    <section class="actions">
      <button
        type="button"
        @click="signIn"
      >
        Sign in with Google
      </button>
      <button
        type="button"
        :disabled="!user"
        @click="signOut"
      >
        Sign out
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseClient, useSupabaseUser } from "#imports";

import type { Database } from "~~/types/database.types";

const client = useSupabaseClient<Database>();
const user = useSupabaseUser();
const errorMessage = ref<string | null>(null);

const authError = computed(() => errorMessage.value);

const signIn = async () => {
  errorMessage.value = null;
  try {
    const { error } = await client.auth.signInWithOAuth({ provider: "google" });

    if (error) {
      errorMessage.value = error.message;
    }
  }
  catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "Unexpected authentication error";
  }
};

const signOut = async () => {
  errorMessage.value = null;
  const { error } = await client.auth.signOut();

  if (error) {
    errorMessage.value = error.message;
  }
};
</script>

<style scoped>
.login-page {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
  max-width: 28rem;
}

.status {
  font-size: 0.95rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: #f3f4f6;
  cursor: pointer;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin-top: 0.5rem;
}
</style>
