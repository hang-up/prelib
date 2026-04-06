import { Hono } from "hono";

import { registerRoutes } from "./routes";

export const createApp = () => {
  const app = new Hono();

  app.get("/api/health", (c) =>
    c.json({
      name: "task-tracker-api",
      status: "ok",
    }),
  );

  registerRoutes(app);

  return app;
};
