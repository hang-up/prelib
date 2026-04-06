import { serve } from "@hono/node-server";

import { createApp } from "./app";
import { backendConfig } from "./lib/config";

const app = createApp();
const publicHost =
  backendConfig.host === "0.0.0.0" ? "localhost" : backendConfig.host;

serve(
  {
    fetch: app.fetch,
    port: backendConfig.port,
    hostname: backendConfig.host,
  },
  (info) => {
    console.log(`Backend listening on http://${publicHost}:${info.port}`);
  },
);
