import type { Hono } from "hono";

import { authRoutes } from "./auth";
import { taskRoutes } from "./tasks";

export const registerRoutes = (app: Hono) => {
  app.route("/api/auth", authRoutes);
  app.route("/api/tasks", taskRoutes);
};
