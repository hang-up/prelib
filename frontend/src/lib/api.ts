import { frontendConfig } from "../config";
import type { AuthUser, Task, TaskStatus } from "../types/task";

const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

const buildApiUrl = (path: string) =>
  `${frontendConfig.apiBaseUrl}${ensureLeadingSlash(path)}`;

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    const message = payload.message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const request = async <T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
    body?: unknown;
  } = {},
): Promise<T> => {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildApiUrl(path), {
    method: options.method ?? "GET",
    credentials: "include",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      extractMessage(payload, `Request failed with status ${response.status}.`),
      response.status,
      payload,
    );
  }

  return payload as T;
};

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: credentials,
    }),
  me: () => request<{ user: AuthUser }>("/auth/me"),
  logout: () => request<{ success: true }>("/auth/logout", { method: "POST" }),
};

export const tasksApi = {
  list: (status?: TaskStatus) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<{ tasks: Task[] }>(`/tasks${query}`);
  },
  create: (input: { title: string; description?: string | null; status: TaskStatus }) =>
    request<{ task: Task }>("/tasks", {
      method: "POST",
      body: input,
    }),
  update: (
    taskId: number,
    input: {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
    },
  ) =>
    request<{ task: Task }>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: input,
    }),
  updateStatus: (taskId: number, status: TaskStatus) =>
    request<{ task: Task }>(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: { status },
    }),
};

