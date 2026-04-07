declare module "better-sqlite3" {
  type StatementResult = {
    changes: number;
    lastInsertRowid: number | bigint;
  };

  class Statement<Result = unknown> {
    run(...params: unknown[]): StatementResult;
    get(...params: unknown[]): Result | undefined;
    all(...params: unknown[]): Result[];
  }

  class Database {
    constructor(filename: string);

    prepare<Result = unknown>(sql: string): Statement<Result>;
    exec(sql: string): this;
    pragma(source: string): unknown;
    transaction<T extends (...args: never[]) => unknown>(fn: T): T;
    close(): void;
  }

  export default Database;
}
