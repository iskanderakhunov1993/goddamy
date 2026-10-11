import assert from "node:assert/strict";
import test from "node:test";
import { authoredLessonIds, courseCurriculum, courseStats, flatLessons, readyModuleIds } from "../src/content/courseCurriculum.js";
import { lessonContent } from "../src/content/lessonContent/index.js";

test("only lessons with authored content count as written", () => {
  const written = flatLessons.filter((lesson) => lesson.authored);
  assert.equal(courseStats.authoredLessons, written.length);
  assert.equal(written.length, flatLessons.filter((lesson) => lessonContent[lesson.id]).length);
  assert.ok(courseStats.authoredLessons <= courseStats.lessons);
  for (const lesson of flatLessons) assert.equal(lesson.authored, Boolean(lessonContent[lesson.id]), lesson.id);
  for (const id of authoredLessonIds) assert.ok(lessonContent[id], id);
});

test("a module is ready only if it has authored lessons", () => {
  for (const module of courseCurriculum) {
    const hasWritten = module.topics.some((topic) => topic.lessons.some((lesson) => lesson.authored));
    assert.equal(readyModuleIds.has(module.id), hasWritten, module.id);
  }
  assert.equal(courseStats.readyModules, readyModuleIds.size);
});
