import { defineConfig } from "@playwright/test";

const backendPort = Number(process.env.PLAYWRIGHT_BACKEND_PORT ?? "49200");
const frontendPort = Number(process.env.PLAYWRIGHT_FRONTEND_PORT ?? "49284");
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${frontendPort}`;
const shouldStartLocalServers = process.env.PLAYWRIGHT_USE_LOCAL_SERVERS !== "false";

export default defineConfig({
  testDir: "./tests",
  webServer: shouldStartLocalServers
    ? [
        {
          command:
            `/bin/zsh -lc 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use v22 >/dev/null && HOST=127.0.0.1 PORT=${backendPort} APP_ORIGIN=http://127.0.0.1:${frontendPort} DISABLE_CORS=true npm run dev'`,
          cwd: "../backend",
          url: `http://127.0.0.1:${backendPort}/api/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command:
            `/bin/zsh -lc 'export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use v22 >/dev/null && VITE_API_BASE_URL=http://127.0.0.1:${backendPort}/api npm run dev -- --host 127.0.0.1 --port ${frontendPort}'`,
          cwd: "../frontend",
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ]
    : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
});
