import { openDb, type DB } from "../db.ts";

export type { DB };

export function freshDb(): DB {
  return openDb(":memory:");
}
