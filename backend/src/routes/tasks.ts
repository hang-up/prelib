import { Hono } from "hono";

export const taskRoutes = new Hono();

taskRoutes.get("/placeholder", (c) =>
  c.json({
    message: "Task routes will be implemented in task 3.2.",
  }),
);
