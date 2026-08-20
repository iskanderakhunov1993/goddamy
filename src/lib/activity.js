const STORAGE_KEY = "godemy-practice-log-v1";

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function loadLog() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLog(log) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // ignore storage failures (private mode, quota) — practice still works, it just won't be remembered
  }
}

export function recordPractice(courseSlug, now = new Date()) {
  const log = loadLog();
  const key = toDateKey(now);
  const courses = new Set(log[key] || []);
  courses.add(courseSlug);
  log[key] = Array.from(courses);
  saveLog(log);
}

// Soft by design: a missed day silently resets currentStreak to 0 — no warning,
// no "you lost your streak" messaging — while totalDays and bestStreak never shrink.
export function getActivitySummary(now = new Date()) {
  const log = loadLog();
  const days = Object.keys(log).sort();
  const totalDays = days.length;

  let currentStreak = 0;
  const cursor = new Date(now);
  if (!log[toDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (log[toDateKey(cursor)]) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let bestStreak = 0;
  let run = 0;
  let prevDate = null;
  for (const key of days) {
    const date = new Date(`${key}T00:00:00`);
    run = prevDate && Math.round((date.getTime() - prevDate.getTime()) / 86400000) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prevDate = date;
  }
  bestStreak = Math.max(bestStreak, currentStreak);

  const weekdayIndex = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - weekdayIndex);
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return { key: toDateKey(day), active: Boolean(log[toDateKey(day)]), isFuture: day > now };
  });

  const weeks = [];
  for (let weeksAgo = 51; weeksAgo >= 0; weeksAgo -= 1) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - weeksAgo * 7);
    let active = false;
    for (let offset = 0; offset < 7; offset += 1) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + offset);
      if (log[toDateKey(day)]) { active = true; break; }
    }
    weeks.push({ key: toDateKey(weekStart), active });
  }

  return { totalDays, currentStreak, bestStreak, last7Days, weeks };
}
