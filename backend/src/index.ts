import { serve } from "@hono/node-server";

import { createApp } from "./app";
import { backendConfig } from "./lib/config";
import { databaseFilePath, initializeDatabase } from "./lib/db";

initializeDatabase();

const app = createApp();
const publicHost =
  backendConfig.host === "0.0.0.0" ? "localhost" : backendConfig.host;

console.log(`SQLite ready at ${databaseFilePath}`);

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
