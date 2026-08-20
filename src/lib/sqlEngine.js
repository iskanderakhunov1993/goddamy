import initSqlJs from "sql.js";
import { SQL_SCHEMA_SQL } from "../content/sqlSchema.js";

let enginePromise = null;

function loadEngine() {
  if (!enginePromise) {
    enginePromise = initSqlJs({ locateFile: (file) => `/${file}` });
  }
  return enginePromise;
}

export async function createSeededDatabase() {
  const SQL = await loadEngine();
  const db = new SQL.Database();
  db.run(SQL_SCHEMA_SQL);
  return db;
}

export function runQuery(db, sql) {
  const trimmed = sql.trim();
  if (!trimmed) return { columns: [], rows: [] };
  const results = db.exec(trimmed);
  if (results.length === 0) return { columns: [], rows: [] };
  const { columns, values } = results[results.length - 1];
  return { columns, rows: values };
}

function normalizeCell(value) {
  if (value === null || value === undefined) return "NULL";
  return String(value);
}

function normalizeRow(row) {
  return row.map(normalizeCell).join("");
}

export function compareResults(userResult, referenceResult, ordered) {
  if (userResult.columns.length !== referenceResult.columns.length) return false;
  if (userResult.rows.length !== referenceResult.rows.length) return false;
  const userRows = userResult.rows.map(normalizeRow);
  const refRows = referenceResult.rows.map(normalizeRow);
  if (ordered) {
    return userRows.every((row, index) => row === refRows[index]);
  }
  const userSorted = [...userRows].sort();
  const refSorted = [...refRows].sort();
  return userSorted.every((row, index) => row === refSorted[index]);
}
