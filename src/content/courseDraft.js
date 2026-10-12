import { courseCurriculum } from "./courseCurriculum.js";

const DRAFT_KEY = "godemy-course-editor-draft-cache-v2";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function isValidCourseDraft(value) {
  return Array.isArray(value) && value.every((courseModule) =>
    courseModule && typeof courseModule.id === "string" && typeof courseModule.title === "string" && Array.isArray(courseModule.topics) &&
    courseModule.topics.every((topic) => topic && typeof topic.id === "string" && typeof topic.title === "string" && Array.isArray(topic.lessons) &&
      topic.lessons.every((lesson) => lesson && typeof lesson.id === "string" && typeof lesson.title === "string")),
  );
}

// Черновик редактора живёт в localStorage и может быть старше программы в коде.
// Модули, которых в нём ещё нет, вставляются на своё место, правки автора не теряются.
export function withNewModules(draft, curriculum = courseCurriculum) {
  const merged = [...draft];
  curriculum.forEach((courseModule, index) => {
    if (merged.some((item) => item.id === courseModule.id)) return;
    const previous = curriculum[index - 1];
    const after = previous ? merged.findIndex((item) => item.id === previous.id) : -1;
    merged.splice(after + 1, 0, clone(courseModule));
  });
  return merged;
}

export function loadCourseDraft() {
  if (typeof window === "undefined") return clone(courseCurriculum);
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DRAFT_KEY));
    return isValidCourseDraft(parsed) ? withNewModules(parsed) : clone(courseCurriculum);
  } catch {
    return clone(courseCurriculum);
  }
}

export function saveCourseDraft(value) {
  if (typeof window === "undefined" || !isValidCourseDraft(value)) return false;
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function resetCourseDraft() {
  if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY);
  return clone(courseCurriculum);
}

export function flattenCourse(value) {
  return value.flatMap((section) =>
    section.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topic, section }))),
  );
}

export function findLesson(value, sectionId, topicId, lessonId) {
  const lessons = flattenCourse(value);
  return lessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || lessons[0];
}

export function courseLessonPath(item) {
  return `/go/lesson/${item.section.id}/${item.topic.id}/${item.id}`;
}

export function createEditorId(prefix) {
  const suffix = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36);
  return `${prefix}-${suffix}`;
}
