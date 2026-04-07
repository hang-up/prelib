import Database from "better-sqlite3";

type SqliteDatabase = InstanceType<typeof Database>;

let database: SqliteDatabase | null = null;
export let databaseFilePath = "";

export const getDatabase = () => {
  if (!database) {
    throw new Error("Database has not been initialized");
  }

  return database;
};

export const initializeDatabaseClient = (nextDatabasePath: string) => {
  if (database) {
    return database;
  }

  databaseFilePath = nextDatabasePath;
  database = new Database(databaseFilePath);
  return database;
};

export const closeDatabase = () => {
  if (!database) {
    return;
  }

  database.close();
  database = null;
};
