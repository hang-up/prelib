import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

type Task = {
  id: number;
  owner: {
    id: number;
    username: string;
  };
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "done";
  createdAt: string;
  updatedAt: string;
};

type AppLike = {
  request: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const TEST_COOKIE_NAME = "task_tracker_test_session";

let app: AppLike;
let closeDatabase: () => void;
let tempDirPath = "";

const toJson = async <T>(response: Response) => (await response.json()) as T;

const loginAs = async (username: string, password: string) => {
  const response = await app.request("/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const setCookieValue = response.headers.get("set-cookie") ?? "";
  const cookie = setCookieValue.split(";")[0] ?? "";

  return {
    response,
    cookie,
  };
};

const getTasks = async (cookie: string) => {
  const response = await app.request("/api/tasks", {
    headers: {
      cookie,
    },
  });
  const payload = await toJson<{ tasks: Task[] }>(response);

  return {
    response,
    tasks: payload.tasks,
  };
};

beforeAll(async () => {
  vi.resetModules();

  tempDirPath = mkdtempSync(join(tmpdir(), "prelib-backend-tests-"));

  process.env.DATABASE_PATH = join(tempDirPath, "task-tracker.sqlite");
  process.env.AUTH_COOKIE_NAME = TEST_COOKIE_NAME;
  process.env.APP_ORIGIN = "http://localhost";
  process.env.DISABLE_CORS = "true";

  const dbModule = await import("../src/lib/db");
  dbModule.initializeDatabase();
  closeDatabase = dbModule.closeDatabase;

  const { createApp } = await import("../src/app");
  app = createApp();
});

afterAll(() => {
  closeDatabase?.();

  if (tempDirPath) {
    rmSync(tempDirPath, { recursive: true, force: true });
  }

  delete process.env.DATABASE_PATH;
  delete process.env.AUTH_COOKIE_NAME;
  delete process.env.APP_ORIGIN;
  delete process.env.DISABLE_CORS;
});

describe("auth API", () => {
  it("authenticates seeded credentials and sets a session cookie", async () => {
    const { response, cookie } = await loginAs("alice", "password123");
    const payload = await toJson<{ user: { id: number; username: string } }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(payload.user.username).toBe("alice");
    expect(cookie).toContain(`${TEST_COOKIE_NAME}=`);
  });

  it("rejects invalid credentials", async () => {
    const { response } = await loginAs("alice", "wrong-password");
    const payload = await toJson<{ message: string }>(response);

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Invalid username or password");
  });

  it("returns 401 for unauthenticated current-user requests", async () => {
    const response = await app.request("/api/auth/me");
    const payload = await toJson<{ message: string }>(response);

    expect(response.status).toBe(401);
    expect(payload.message).toBe("Authentication required");
  });

  it("returns the authenticated identity for /api/auth/me", async () => {
    const { cookie } = await loginAs("bob", "password456");

    const response = await app.request("/api/auth/me", {
      headers: {
        cookie,
      },
    });
    const payload = await toJson<{ user: { id: number; username: string } }>(
      response,
    );

    expect(response.status).toBe(200);
    expect(payload.user.username).toBe("bob");
  });
});

describe("tasks API", () => {
  it("validates task creation payloads", async () => {
    const { cookie } = await loginAs("alice", "password123");

    const response = await app.request("/api/tasks", {
      method: "POST",
      headers: {
        cookie,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        status: "todo",
      }),
    });

    expect(response.status).toBe(400);
  });

  it("returns a cross-user task list for authenticated clients", async () => {
    const { cookie } = await loginAs("alice", "password123");
    const { response, tasks } = await getTasks(cookie);
    const owners = new Set(tasks.map((task) => task.owner.username));

    expect(response.status).toBe(200);
    expect(tasks.length).toBeGreaterThanOrEqual(4);
    expect(owners.has("alice")).toBe(true);
    expect(owners.has("bob")).toBe(true);
  });

  it("rejects non-owner task status updates and preserves the task", async () => {
    const { cookie: aliceCookie } = await loginAs("alice", "password123");
    const { cookie: bobCookie } = await loginAs("bob", "password456");

    const before = await getTasks(aliceCookie);
    const targetTask = before.tasks.find((task) => task.owner.username === "alice");

    expect(targetTask).toBeDefined();

    if (!targetTask) {
      return;
    }

    const requestedStatus = targetTask.status === "done" ? "todo" : "done";

    const forbiddenResponse = await app.request(
      `/api/tasks/${targetTask.id}/status`,
      {
        method: "PATCH",
        headers: {
          cookie: bobCookie,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          status: requestedStatus,
        }),
      },
    );

    expect(forbiddenResponse.status).toBe(403);

    const after = await getTasks(aliceCookie);
    const afterTask = after.tasks.find((task) => task.id === targetTask.id);

    expect(afterTask?.status).toBe(targetTask.status);
  });

  it("allows owners to update their own tasks", async () => {
    const { cookie } = await loginAs("bob", "password456");
    const { tasks } = await getTasks(cookie);
    const ownedTask = tasks.find((task) => task.owner.username === "bob");

    expect(ownedTask).toBeDefined();

    if (!ownedTask) {
      return;
    }

    const nextTitle = `Updated by backend test ${Date.now()}`;

    const response = await app.request(`/api/tasks/${ownedTask.id}`, {
      method: "PATCH",
      headers: {
        cookie,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: nextTitle,
        description: null,
        status: "in-progress",
      }),
    });
    const payload = await toJson<{ task: Task }>(response);

    expect(response.status).toBe(200);
    expect(payload.task.owner.username).toBe("bob");
    expect(payload.task.title).toBe(nextTitle);
    expect(payload.task.status).toBe("in-progress");
  });
});
