import Database from "better-sqlite3";
import { Kysely, SqliteDialect, type Generated } from "kysely";

// ─── Table Types ─────────────────────────────────────────────────────────────

export interface SeedPacketTable {
  id: Generated<number>;
  name: string;
  description: string;
  category: string;
  condition: string;
  quantity: number;
  claimed_by: string | null;
}

export interface DatabaseSchema {
  seed_packets: SeedPacketTable;
}

// ─── Setup ───────────────────────────────────────────────────────────────────

export type DB = Kysely<DatabaseSchema>;

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS seed_packets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    condition TEXT NOT NULL CHECK(condition IN ('new', 'used')),
    quantity INTEGER NOT NULL,
    claimed_by TEXT DEFAULT NULL
  );
`;

export function openDb(path: string): DB {
  const sqlite = new Database(path);
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(SCHEMA_SQL);

  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({ database: sqlite }),
  });
}
