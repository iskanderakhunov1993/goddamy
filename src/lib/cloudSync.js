import { supabase } from "./supabaseClient.js";

// Every key here mirrors a localStorage key managed by one of the lib/*.js
// modules (progress, subscription, profile, quizAnswers, lessonFeedback,
// enrollment, activity). Keeping the table generic (user_id, key, value)
// means a signed-in user's data round-trips through Postgres without each
// module needing its own table or its own sync code.
const KNOWN_KEYS = [
  "godemy-lesson-progress-v1",
  "godemy-subscription-v1",
  "godemy-profile-v1",
  "godemy-quiz-answers-v1",
  "godemy-lesson-feedback-v1",
  "godemy-enrolled-courses-v1",
  "godemy-practice-log-v1",
];

// Fire-and-forget: called from every local save function. Never throws —
// a failed sync should not break the local-first experience.
export function pushState(key, value) {
  if (!supabase) return;
  supabase.auth.getUser().then(({ data }) => {
    const user = data?.user;
    if (!user) return;
    supabase.from("user_state").upsert({ user_id: user.id, key, value, updated_at: new Date().toISOString() }).then(() => {});
  }).catch(() => {});
}

function readLocal(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures — sync still applied server-side
  }
}

// Called once after sign-in (and on app boot for a returning session).
// Remote wins for any key it has (cross-device source of truth); a key that
// exists only locally — guest progress made before creating an account —
// is pushed up instead of being discarded.
export async function syncOnSignIn() {
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;

  const { data, error } = await supabase.from("user_state").select("key, value");
  const remote = error || !data ? {} : Object.fromEntries(data.map((row) => [row.key, row.value]));

  const toPush = [];
  for (const key of KNOWN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(remote, key)) {
      writeLocal(key, remote[key]);
    } else {
      const local = readLocal(key);
      if (local !== undefined) toPush.push({ user_id: user.id, key, value: local, updated_at: new Date().toISOString() });
    }
  }
  if (toPush.length) await supabase.from("user_state").upsert(toPush);
}
