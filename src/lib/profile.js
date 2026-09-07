import { pushState } from "./cloudSync.js";

const STORAGE_KEY = "godemy-profile-v1";

const DEFAULT_PROFILE = {
  name: "Гость Godemy",
  about: "Учусь писать backend-сервисы через реальные проекты.",
  city: "",
  github: "",
};

export function loadProfile() {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? { ...DEFAULT_PROFILE, ...saved } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // ignore storage failures — the edit still applies this session, it just won't be remembered
  }
  pushState(STORAGE_KEY, profile);
}

export function saveProfileName(name) {
  if (!name) return;
  saveProfile({ ...loadProfile(), name });
}
