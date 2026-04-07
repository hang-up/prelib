import type { OpenAPIHono } from "@hono/zod-openapi";

import type { AppBindings } from "../services/auth";
import { authRoutes } from "./auth";
import { taskRoutes } from "./tasks";

export const registerRoutes = (app: OpenAPIHono<AppBindings>) => {
  app.route("/api/auth", authRoutes);
  app.route("/api/tasks", taskRoutes);
};
