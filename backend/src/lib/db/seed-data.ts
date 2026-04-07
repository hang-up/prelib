import type { TaskStatus } from "./schema";

type SeedUser = {
  username: string;
  passwordHash: string;
};

type SeedTask = {
  ownerUsername: string;
  title: string;
  description: string;
  status: TaskStatus;
};

export const seededUsers: SeedUser[] = [
  {
    username: "alice",
    passwordHash: "$2b$10$1CwF9LFoLKBIrZ0uOV/duuESHNvtXrYoIyW6/aEUL6sJ1lDHqqrPO", // "password123"
  },
  {
    username: "bob",
    passwordHash: "$2b$10$Ggqhd0OaQB879iaK0zsp2evl//WQLUiS0KXnoPD4Ri.bqBA3BsO.G", // "password456"
  },
];

export const seededTasks: SeedTask[] = [
  {
    ownerUsername: "alice",
    title: "Plan API route modules",
    description: "Break auth and task handlers into focused backend files.",
    status: "todo",
  },
  {
    ownerUsername: "alice",
    title: "Draft frontend workspace layout",
    description: "Translate the design guidance into a compact task board shell.",
    status: "in-progress",
  },
  {
    ownerUsername: "bob",
    title: "Verify nginx reverse proxy paths",
    description: "Confirm /, /api, and /adminer resolve to the expected upstreams.",
    status: "done",
  },
  {
    ownerUsername: "bob",
    title: "Document tradeoffs",
    description: "Capture seeded auth and ownership rules in project docs.",
    status: "todo",
  },
];
