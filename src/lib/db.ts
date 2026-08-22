import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Local/dev data layer backed by SQLite. Schema mirrors the Supabase/Postgres
// production schema at src/db/schema.postgres.sql — see README for migration notes.

const DB_PATH = path.join(process.cwd(), "data", "app.db");

declare global {
  // eslint-disable-next-line no-var
  var __sihDb: Database.Database | undefined;
}

function init(): Database.Database {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const schemaPath = path.join(process.cwd(), "src", "db", "schema.sqlite.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

export function getDb(): Database.Database {
  if (!global.__sihDb) {
    global.__sihDb = init();
  }
  return global.__sihDb;
}
