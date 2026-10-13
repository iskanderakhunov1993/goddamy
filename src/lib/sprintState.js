import { pushState } from "./cloudSync.js";

// Состояние буткемпа: доска спринта, сданные ссылки и ретроспективы.
// { boards: { [sprintId]: { [taskId]: "doing" | "done" } },
//   submissions: { [id]: { url, ok, checkedAt } },
//   retros: { [sprintId]: { answers: { [questionId]: text }, savedAt } } }
const STORAGE_KEY = "godemy-bootcamp-v1";

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
    // хранилище недоступно (приватный режим, квота) — состояние живёт до перезагрузки страницы
  }
  pushState(STORAGE_KEY, state);
}

function update(section, id, value) {
  const state = loadState();
  state[section] = { ...(state[section] || {}), [id]: value };
  saveState(state);
  return value;
}

export const WIP_LIMIT = 1;

export function getBoard(sprintId) {
  const board = loadState().boards?.[sprintId];
  return board && typeof board === "object" ? board : {};
}

// Возвращает новую доску или null, если перенос нарушил бы лимит колонки «В работе».
export function moveCard(sprintId, taskId, status) {
  const board = { ...getBoard(sprintId) };
  if (status === "doing" && Object.entries(board).filter(([id, value]) => value === "doing" && id !== taskId).length >= WIP_LIMIT) return null;
  if (status === "todo") delete board[taskId];
  else board[taskId] = status;
  return update("boards", sprintId, board);
}

export function getSubmission(id) {
  const saved = loadState().submissions?.[id];
  return saved && typeof saved === "object" ? saved : null;
}

export function saveSubmission(id, url, ok) {
  return update("submissions", id, { url, ok, checkedAt: new Date().toISOString() });
}

export function getRetro(sprintId) {
  const saved = loadState().retros?.[sprintId];
  return saved && typeof saved === "object" ? saved : { answers: {}, savedAt: null };
}

export function saveRetro(sprintId, answers) {
  return update("retros", sprintId, { answers, savedAt: new Date().toISOString() });
}
