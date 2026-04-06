const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const frontendConfig = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? "Prelib Task Tracker",
  apiBaseUrl: trimTrailingSlash(
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4200/api",
  ),
};
