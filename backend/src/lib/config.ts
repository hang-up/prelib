const DEFAULT_PORT = 4200;

const parsePort = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const backendConfig = {
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, DEFAULT_PORT),
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost",
  databasePath: process.env.DATABASE_PATH ?? "../db/data/task-tracker.sqlite",
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "task_tracker_session",
};
