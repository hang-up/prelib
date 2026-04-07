<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();
const { login, isLoading, authError, clearAuthError, isAuthenticated } = useAuth();

const form = reactive({
  username: "alice",
  password: "password123",
});

const formError = ref<string | null>(null);

const getRedirectTarget = () => {
  const redirect = route.query.redirect;
  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }

  return "/tasks";
};

const fillCredentials = (username: string, password: string) => {
  form.username = username;
  form.password = password;
  formError.value = null;
  clearAuthError();
};

const submitLogin = async () => {
  formError.value = null;
  clearAuthError();

  const username = form.username.trim();
  const password = form.password.trim();

  if (!username || !password) {
    formError.value = "Username and password are required.";
    return;
  }

  try {
    await login(username, password);
    await router.replace(getRedirectTarget());
  } catch {
    // Error is surfaced through authError.
  }
};

watchEffect(() => {
  if (isAuthenticated.value) {
    void router.replace(getRedirectTarget());
  }
});
</script>

<template>
  <main class="page-shell page-shell--auth">
    <Card as="section" class="auth-card">
      <p class="eyebrow">Welcome!</p>
      <h1 class="page-title">Sign in to task tracker</h1>
      <p class="body-copy">
        Use one of the seeded demo users to enter the shared workspace.
      </p>

      <div class="auth-seed-actions">
        <Button type="button" variant="outline" size="sm" @click="fillCredentials('alice', 'password123')">
          Use Alice
        </Button>
        <Button type="button" variant="outline" size="sm" @click="fillCredentials('bob', 'password456')">
          Use Bob
        </Button>
      </div>

      <form class="form-stack" @submit.prevent="submitLogin">
        <Label for="username">Username</Label>
        <Input
          id="username"
          v-model="form.username"
          name="username"
          autocomplete="username"
          required
        />

        <Label for="password">Password</Label>
        <Input
          id="password"
          v-model="form.password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        />

        <p v-if="formError" class="error-banner">
          {{ formError }}
        </p>
        <p v-else-if="authError" class="error-banner">
          {{ authError }}
        </p>

        <Button type="submit" size="lg" :disabled="isLoading">
          {{ isLoading ? "Signing in..." : "Sign in" }}
        </Button>
      </form>
    </Card>
  </main>
</template>

<style scoped>
.auth-card {
  width: min(100%, 520px);
  padding: 24px;
}

.auth-seed-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 18px;
  }
}
</style>
