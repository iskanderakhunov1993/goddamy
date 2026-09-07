import { pushState } from "./cloudSync.js";

const STORAGE_KEY = "godemy-lesson-feedback-v1";

function loadState() {
  if (typeof window === "undefined") return {};
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveState(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage failures — the reaction still applies this session, it just won't be remembered
  }
  pushState(STORAGE_KEY, state);
}

export function getLessonFeedback(lessonId) {
  const state = loadState();
  return state[lessonId] || null;
}

export function setLessonFeedback(lessonId, value) {
  const state = loadState();
  state[lessonId] = value;
  saveState(state);
}
