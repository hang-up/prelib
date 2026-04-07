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

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  return fallback;
};

export const backendConfig = {
  host: process.env.HOST ?? "0.0.0.0",
  port: parsePort(process.env.PORT, DEFAULT_PORT),
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost",
  disableCors: parseBoolean(process.env.DISABLE_CORS, false),
  databasePath: process.env.DATABASE_PATH ?? "../db/data/task-tracker.sqlite",
  authCookieName: process.env.AUTH_COOKIE_NAME ?? "task_tracker_session",
};
