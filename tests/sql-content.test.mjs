import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { sqlChallenges, getSqlChallenge } from "../src/content/sqlChallenges.js";
import { SQL_SCHEMA_SQL, sqlSchemaTables } from "../src/content/sqlSchema.js";

const wasmDir = path.dirname(fileURLToPath(import.meta.resolve("sql.js/dist/sql-wasm.wasm")));

async function seededDb() {
  const SQL = await initSqlJs({ locateFile: (file) => path.join(wasmDir, file) });
  const db = new SQL.Database();
  db.run(SQL_SCHEMA_SQL);
  return db;
}

function query(db, sql) {
  const results = db.exec(sql);
  if (results.length === 0) return { columns: [], rows: [] };
  const { columns, values } = results[results.length - 1];
  return { columns, rows: values };
}

test("every sql challenge has a unique id and a runnable reference query", async () => {
  assert.equal(new Set(sqlChallenges.map((item) => item.id)).size, sqlChallenges.length);
  const db = await seededDb();
  for (const challenge of sqlChallenges) {
    assert.doesNotThrow(() => query(db, challenge.referenceQuery), `${challenge.id} reference query should be valid SQL`);
  }
  db.close();
});

test("reference queries return at least one row against the seed data", async () => {
  const db = await seededDb();
  for (const challenge of sqlChallenges) {
    const result = query(db, challenge.referenceQuery);
    assert.ok(result.rows.length > 0, `${challenge.id} should return at least one row from the seed data`);
  }
  db.close();
});

test("schema tables are queryable and non-empty", async () => {
  const db = await seededDb();
  for (const table of sqlSchemaTables) {
    const result = query(db, `SELECT * FROM ${table};`);
    assert.ok(result.rows.length > 0, `${table} should have seed rows`);
  }
  db.close();
});

test("getSqlChallenge falls back to the first challenge for an unknown id", () => {
  assert.equal(getSqlChallenge("does-not-exist"), sqlChallenges[0]);
});
