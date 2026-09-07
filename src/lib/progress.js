import { pushState } from "./cloudSync.js";

const STORAGE_KEY = "godemy-lesson-progress-v1";

function loadState() {
  if (typeof window === "undefined") return {};
  try {
    const state = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return state && typeof state === "object" ? state : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures (private mode, quota) — completion still works this session, it just won't be remembered
  }
  pushState(STORAGE_KEY, state);
}

export function markLessonComplete(courseSlug, lessonId) {
  const state = loadState();
  const done = new Set(state[courseSlug] || []);
  if (!done.has(lessonId)) {
    done.add(lessonId);
    state[courseSlug] = Array.from(done);
    saveState(state);
  }
}

export function isLessonComplete(courseSlug, lessonId) {
  const state = loadState();
  return Boolean(state[courseSlug]?.includes(lessonId));
}

export function getCompletedLessonIds(courseSlug) {
  const state = loadState();
  return state[courseSlug] || [];
}

export function getCompletedCount(courseSlug) {
  return getCompletedLessonIds(courseSlug).length;
}
