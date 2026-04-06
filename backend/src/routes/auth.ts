import { Hono } from "hono";

export const authRoutes = new Hono();

authRoutes.get("/placeholder", (c) =>
  c.json({
    message: "Seeded auth routes will be implemented in task 3.1.",
  }),
);
