const STORAGE_KEY = "godemy-subscription-v1";

export function hasActiveSubscription() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "active";
  } catch {
    return false;
  }
}

export function activateSubscription() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "active");
  } catch {
    // ignore storage failures — activation still works this session, it just won't be remembered
  }
}
