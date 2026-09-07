import { pushState } from "./cloudSync.js";

const STORAGE_KEY = "godemy-subscription-v1";

export function hasActiveSubscription() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "active") return true; // legacy pre-sync format
    return JSON.parse(raw) === "active";
  } catch {
    return false;
  }
}

export function activateSubscription() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify("active"));
  } catch {
    // ignore storage failures — activation still works this session, it just won't be remembered
  }
  pushState(STORAGE_KEY, "active");
}
