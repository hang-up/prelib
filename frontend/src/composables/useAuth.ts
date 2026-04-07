import { computed, readonly, ref } from "vue";

import { ApiError, authApi } from "../lib/api";
import type { AuthUser } from "../types/task";

const currentUser = ref<AuthUser | null>(null);
const isLoading = ref(false);
const isBootstrapping = ref(false);
const hasBootstrapped = ref(false);
const authError = ref<string | null>(null);
const bootstrapError = ref<string | null>(null);

let bootstrapPromise: Promise<AuthUser | null> | null = null;

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message.trim().length > 0
    ? error.message
    : fallback;

export const ensureAuthBootstrapped = async (): Promise<AuthUser | null> => {
  if (hasBootstrapped.value) {
    return currentUser.value;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  isBootstrapping.value = true;
  bootstrapError.value = null;

  bootstrapPromise = (async () => {
    try {
      const response = await authApi.me();
      currentUser.value = response.user;
      return response.user;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        currentUser.value = null;
        return null;
      }

      currentUser.value = null;
      bootstrapError.value = toErrorMessage(
        error,
        "Unable to verify your session right now.",
      );
      return null;
    } finally {
      hasBootstrapped.value = true;
      isBootstrapping.value = false;
      bootstrapPromise = null;
    }
  })();

  return bootstrapPromise;
};

export const useAuth = () => {
  const isAuthenticated = computed(() => currentUser.value !== null);

  const clearAuthError = () => {
    authError.value = null;
  };

  const login = async (username: string, password: string) => {
    isLoading.value = true;
    authError.value = null;

    try {
      const response = await authApi.login({ username, password });
      currentUser.value = response.user;
      hasBootstrapped.value = true;
      return response.user;
    } catch (error) {
      currentUser.value = null;
      authError.value = toErrorMessage(
        error,
        "Unable to sign in with those credentials.",
      );
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    authError.value = null;

    try {
      await authApi.logout();
    } finally {
      currentUser.value = null;
      hasBootstrapped.value = true;
      isLoading.value = false;
    }
  };

  return {
    user: readonly(currentUser),
    isAuthenticated,
    isLoading: readonly(isLoading),
    isBootstrapping: readonly(isBootstrapping),
    hasBootstrapped: readonly(hasBootstrapped),
    authError: readonly(authError),
    bootstrapError: readonly(bootstrapError),
    clearAuthError,
    login,
    logout,
    ensureBootstrapped: ensureAuthBootstrapped,
  };
};

