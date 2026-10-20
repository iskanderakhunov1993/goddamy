import { authoredLessonIds, courseCurriculum } from "../content/courseCurriculum.js";
import { courseLessonPath } from "../content/courseDraft.js";
import { getLessonTasks } from "../content/goLessonTasks/index.js";
import { getCompletedLessonIds, markLessonComplete } from "./progress.js";

// Прогресс курса Go: уроки (ключ «go») и решённые задания (ключ «go-tasks»).
// Уроки открываются по порядку (решение владельца, 2026-10-20): следующий
// написанный урок доступен, когда пройден предыдущий.
export const GO_COURSE = "go";
export const GO_TASKS = "go-tasks";

export function getSolvedTaskKeys() {
  return new Set(getCompletedLessonIds(GO_TASKS));
}

export function markTaskSolved(lessonId, taskKey) {
  markLessonComplete(GO_TASKS, taskKey);
  const solved = getSolvedTaskKeys();
  const allSolved = getLessonTasks(lessonId).every((task) => solved.has(task.key));
  if (allSolved) markLessonComplete(GO_COURSE, lessonId);
  return allSolved;
}

// lessons — написанные уроки курса в порядке прохождения.
export function lessonAccess(lessons, lessonId, completed = new Set(getCompletedLessonIds(GO_COURSE))) {
  const index = lessons.findIndex((item) => item.id === lessonId);
  if (index <= 0) return { unlocked: true, blockedBy: null };
  if (completed.has(lessonId)) return { unlocked: true, blockedBy: null };
  const previous = lessons[index - 1];
  return completed.has(previous.id) ? { unlocked: true, blockedBy: null } : { unlocked: false, blockedBy: lessons.slice(0, index).find((item) => !completed.has(item.id)) || previous };
}

// Написанные уроки курса по порядку прохождения, с темой и модулем.
export const authoredGoLessons = courseCurriculum.flatMap((section) => section.topics.flatMap((topic) => topic.lessons.filter((lesson) => authoredLessonIds.has(lesson.id)).map((lesson) => ({ ...lesson, topic, section }))));

export const findGoLesson = (lessonId) => authoredGoLessons.find((item) => item.id === lessonId) || null;

export const taskPath = (lesson, number) => `${courseLessonPath(lesson)}/task/${number}`;
