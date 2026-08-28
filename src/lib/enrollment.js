const STORAGE_KEY = "godemy-enrolled-courses-v1";

function loadList() {
  if (typeof window === "undefined") return [];
  try {
    const list = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveList(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage failures (private mode, quota) — enrolling still navigates, it just won't be remembered
  }
}

export function enrollCourse(slug) {
  const list = loadList();
  if (!list.includes(slug)) {
    list.push(slug);
    saveList(list);
  }
}

export function getEnrolledCourses() {
  return loadList();
}
