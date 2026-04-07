import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";

import type { AppBindings } from "./services/auth";
import { backendConfig } from "./lib/config";
import { registerRoutes } from "./routes";

export const createApp = () => {
  const app = new OpenAPIHono<AppBindings>();
  const corsOrigin = backendConfig.disableCors
    ? (origin: string) => origin || backendConfig.appOrigin
    : backendConfig.appOrigin;

  app.use(
    "/api/*",
    cors({
      origin: corsOrigin,
      credentials: true,
      allowHeaders: ["Content-Type"],
      allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
    }),
  );

  app.get("/api/health", (c) =>
    c.json({
      name: "task-tracker-api",
      status: "ok",
    }),
  );

  app.doc("/api/openapi.json", {
    openapi: "3.0.0",
    info: {
      title: "Prelib Task Tracker API",
      version: "0.1.0",
      description: "Seeded auth + ownership-aware task tracking API",
    },
  });

  registerRoutes(app);

  return app;
};
