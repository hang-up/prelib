import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const parsePort = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.FRONTEND_HOST || "0.0.0.0";
  const port = parsePort(env.FRONTEND_PORT, 6384);

  return {
    plugins: [vue()],
    server: {
      host,
      port,
    },
    preview: {
      host,
      port,
    },
  };
});
