const STORAGE_KEY = "godemy-quiz-answers-v1";

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
    // ignore storage failures — the answer still applies this session, it just won't be remembered
  }
}

export function getQuizAnswer(blockId) {
  const state = loadState();
  return typeof state[blockId] === "number" ? state[blockId] : null;
}

export function saveQuizAnswer(blockId, selectedIndex) {
  const state = loadState();
  state[blockId] = selectedIndex;
  saveState(state);
}
