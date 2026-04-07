import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

import { TASK_STATUSES } from "../lib/constants";
import { type AppBindings, requireAuthenticatedUser } from "../services/auth";
import {
  createTask as createTaskForUser,
  listTasks,
  updateTask,
  updateTaskStatus,
} from "../services/tasks";

const tasksTag = ["Tasks"];

const taskStatusSchema = z.enum(TASK_STATUSES).openapi("TaskStatus");

const taskSchema = z
  .object({
    id: z.number().int().positive(),
    owner: z.object({
      id: z.number().int().positive(),
      username: z.string(),
    }),
    title: z.string(),
    description: z.string().nullable(),
    status: taskStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Task");

const taskListResponseSchema = z.object({
  tasks: z.array(taskSchema),
});

const taskResponseSchema = z.object({
  task: taskSchema,
});

const errorSchema = z
  .object({
    message: z.string(),
  })
  .openapi("TaskApiError");

const taskIdParamSchema = z.object({
  taskId: z.coerce
    .number()
    .int()
    .positive()
    .openapi({
      param: {
        name: "taskId",
        in: "path",
      },
      example: 1,
    }),
});

const listTasksQuerySchema = z.object({
  status: taskStatusSchema.optional(),
});

const createTaskRequestSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  status: taskStatusSchema.default("todo"),
});

const updateTaskRequestSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().nullable().optional(),
    status: taskStatusSchema.optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.description !== undefined ||
      value.status !== undefined,
    "At least one field must be provided.",
  );

const updateTaskStatusRequestSchema = z.object({
  status: taskStatusSchema,
});

const listTasksRoute = createRoute({
  method: "get",
  path: "/",
  tags: tasksTag,
  summary: "List tasks across all owners",
  middleware: [requireAuthenticatedUser] as const,
  request: {
    query: listTasksQuerySchema,
  },
  responses: {
    200: {
      description: "Tasks across users.",
      content: {
        "application/json": {
          schema: taskListResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthenticated request.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

const createTaskRoute = createRoute({
  method: "post",
  path: "/",
  tags: tasksTag,
  summary: "Create a task for the authenticated user",
  middleware: [requireAuthenticatedUser] as const,
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: createTaskRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Task created.",
      content: {
        "application/json": {
          schema: taskResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthenticated request.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

const updateTaskRoute = createRoute({
  method: "patch",
  path: "/{taskId}",
  tags: tasksTag,
  summary: "Edit title, description, and/or status for an owned task",
  middleware: [requireAuthenticatedUser] as const,
  request: {
    params: taskIdParamSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateTaskRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Task updated.",
      content: {
        "application/json": {
          schema: taskResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthenticated request.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    403: {
      description: "Task belongs to another user.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Task not found.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

const updateTaskStatusRoute = createRoute({
  method: "patch",
  path: "/{taskId}/status",
  tags: tasksTag,
  summary: "Update status for an owned task",
  middleware: [requireAuthenticatedUser] as const,
  request: {
    params: taskIdParamSchema,
    body: {
      required: true,
      content: {
        "application/json": {
          schema: updateTaskStatusRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Task status updated.",
      content: {
        "application/json": {
          schema: taskResponseSchema,
        },
      },
    },
    401: {
      description: "Unauthenticated request.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    403: {
      description: "Task belongs to another user.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
    404: {
      description: "Task not found.",
      content: {
        "application/json": {
          schema: errorSchema,
        },
      },
    },
  },
});

export const taskRoutes = new OpenAPIHono<AppBindings>();

taskRoutes.openapi(listTasksRoute, (c) => {
  const { status } = c.req.valid("query");

  return c.json(
    {
      tasks: listTasks(status),
    },
    200,
  );
});

taskRoutes.openapi(createTaskRoute, (c) => {
  const { id: userId } = c.var.authUser;
  const { title, description, status } = c.req.valid("json");

  const createdTask = createTaskForUser(userId, {
    title,
    description,
    status,
  });

  return c.json(
    {
      task: createdTask,
    },
    201,
  );
});

taskRoutes.openapi(updateTaskRoute, (c) => {
  const { id: userId } = c.var.authUser;
  const { taskId } = c.req.valid("param");
  const input = c.req.valid("json");

  const result = updateTask(userId, taskId, input);

  if (result.kind === "not_found") {
    return c.json(
      {
        message: "Task not found.",
      },
      404,
    );
  }

  if (result.kind === "forbidden") {
    return c.json(
      {
        message: "Only the owner can update this task.",
      },
      403,
    );
  }

  return c.json(
    {
      task: result.task,
    },
    200,
  );
});

taskRoutes.openapi(updateTaskStatusRoute, (c) => {
  const { id: userId } = c.var.authUser;
  const { taskId } = c.req.valid("param");
  const { status } = c.req.valid("json");

  const result = updateTaskStatus(userId, taskId, status);

  if (result.kind === "not_found") {
    return c.json(
      {
        message: "Task not found.",
      },
      404,
    );
  }

  if (result.kind === "forbidden") {
    return c.json(
      {
        message: "Only the owner can update this task.",
      },
      403,
    );
  }

  return c.json(
    {
      task: result.task,
    },
    200,
  );
});
