declare module "node:sqlite" {
  interface StatementSync {
    run(...params: unknown[]): unknown
    get(...params: unknown[]): unknown
    all(...params: unknown[]): unknown[]
  }

  class DatabaseSync {
    constructor(path?: string)
    exec(sql: string): void
    prepare(sql: string): StatementSync
    close(): void
  }

  export { DatabaseSync, type StatementSync }
}
