import { pushState } from "./cloudSync.js";

const STORAGE_KEY = "godemy-task-checklist-v1";

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
    // ignore storage failures — the checklist still applies this session, it just won't be remembered
  }
  pushState(STORAGE_KEY, state);
}

export function getCheckedItems(blockId) {
  const state = loadState();
  return Array.isArray(state[blockId]) ? state[blockId] : [];
}

export function toggleCheckedItem(blockId, itemIndex) {
  const state = loadState();
  const current = Array.isArray(state[blockId]) ? state[blockId] : [];
  state[blockId] = current.includes(itemIndex) ? current.filter((index) => index !== itemIndex) : [...current, itemIndex];
  saveState(state);
  return state[blockId];
}
