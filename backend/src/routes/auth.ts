import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import type { AppBindings } from "../services/auth";
import {
  authenticateUser,
  clearSessionCookie,
  requireAuthenticatedUser,
  setSessionCookie,
} from "../services/auth";

const userSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    username: z.string().openapi({ example: "alice" }),
  })
  .openapi("AuthUser");

const authErrorSchema = z
  .object({
    message: z.string().openapi({ example: "Authentication required" }),
  })
  .openapi("AuthError");

const loginBodySchema = z
  .object({
    username: z.string().min(1).openapi({ example: "alice" }),
    password: z.string().min(1).openapi({ example: "password123" }),
  })
  .openapi("LoginRequest");

const loginResponseSchema = z
  .object({
    user: userSchema,
  })
  .openapi("LoginResponse");

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginBodySchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Authenticated successfully",
      content: {
        "application/json": {
          schema: loginResponseSchema,
        },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
  },
  tags: ["Auth"],
});

const currentUserRoute = createRoute({
  method: "get",
  path: "/me",
  responses: {
    200: {
      description: "Current authenticated user",
      content: {
        "application/json": {
          schema: z.object({ user: userSchema }),
        },
      },
    },
    401: {
      description: "Client is not authenticated",
      content: {
        "application/json": {
          schema: authErrorSchema,
        },
      },
    },
  },
  tags: ["Auth"],
});

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  responses: {
    200: {
      description: "Logged out",
      content: {
        "application/json": {
          schema: z.object({ success: z.literal(true) }),
        },
      },
    },
  },
  tags: ["Auth"],
});

export const authRoutes = new OpenAPIHono<AppBindings>();

authRoutes.openapi(loginRoute, async (c) => {
  const body = c.req.valid("json");
  const user = await authenticateUser(body.username, body.password);

  if (!user) {
    return c.json({ message: "Invalid username or password" }, 401);
  }

  setSessionCookie(c, user.id);

  return c.json(
    {
      user,
    },
    200,
  );
});

authRoutes.use("/me", requireAuthenticatedUser);
authRoutes.openapi(currentUserRoute, (c) => {
  const user = c.get("authUser");

  return c.json(
    {
      user,
    },
    200,
  );
});

authRoutes.openapi(logoutRoute, (c) => {
  clearSessionCookie(c);

  return c.json({ success: true }, 200);
});
