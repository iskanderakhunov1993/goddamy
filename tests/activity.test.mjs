import assert from "node:assert/strict";
import test from "node:test";

function makeMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
}

async function freshActivityModule() {
  return import(`../src/lib/activity.js?t=${Date.now()}-${Math.random()}`);
}

test("recordPractice + getActivitySummary track consecutive days without punishing a gap", async () => {
  globalThis.window = { localStorage: makeMemoryStorage() };
  const { recordPractice, getActivitySummary } = await freshActivityModule();

  const day1 = new Date("2026-08-10T10:00:00Z");
  const day2 = new Date("2026-08-11T10:00:00Z");
  const day3 = new Date("2026-08-12T10:00:00Z");
  const gapDay = new Date("2026-08-14T10:00:00Z"); // skipped the 13th

  recordPractice("go", day1);
  recordPractice("sql", day2);
  recordPractice("qa", day3);

  let summary = getActivitySummary(day3);
  assert.equal(summary.totalDays, 3);
  assert.equal(summary.currentStreak, 3);
  assert.equal(summary.bestStreak, 3);

  recordPractice("go", gapDay);
  summary = getActivitySummary(gapDay);
  assert.equal(summary.totalDays, 4, "a missed day should not erase past practice days");
  assert.equal(summary.currentStreak, 1, "streak resets silently after a gap, no punishment beyond the reset");
  assert.equal(summary.bestStreak, 3, "best streak is preserved even after the gap");

  delete globalThis.window;
});

test("getActivitySummary does not require practicing today to keep yesterday's streak alive", async () => {
  globalThis.window = { localStorage: makeMemoryStorage() };
  const { recordPractice, getActivitySummary } = await freshActivityModule();

  const yesterday = new Date("2026-08-19T09:00:00Z");
  const today = new Date("2026-08-20T09:00:00Z");
  recordPractice("go", yesterday);

  const summary = getActivitySummary(today);
  assert.equal(summary.currentStreak, 1, "streak should still count yesterday even before today's practice");

  delete globalThis.window;
});

test("last7Days and weeks arrays have stable, expected lengths", async () => {
  globalThis.window = { localStorage: makeMemoryStorage() };
  const { getActivitySummary } = await freshActivityModule();
  const summary = getActivitySummary(new Date("2026-08-20T09:00:00Z"));
  assert.equal(summary.last7Days.length, 7);
  assert.equal(summary.weeks.length, 52);
  delete globalThis.window;
});
