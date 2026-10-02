import { securityBasics } from "./securityBasics.js";
import { securityCryptoWeb } from "./securityCryptoWeb.js";

export const SECURITY_SLUG = "security";
export const SECURITY_PRACTICE_SLUG = "security-practice";

// Уроки и блоки получают устойчивые id: `${module}-${topic}-${n}` и `${lesson}-b${i}`.
// По ним хранятся прогресс, ответы квизов и отметки чек-листов.
const build = (module) => ({
  ...module,
  topics: module.topics.map((topic) => ({
    ...topic,
    lessons: topic.lessons.map((lesson, index) => {
      const id = `${module.id}-${topic.id}-${index + 1}`;
      return { ...lesson, id, blocks: lesson.blocks.map((block, blockIndex) => ({ id: `${id}-b${blockIndex}`, ...block })) };
    }),
  })),
});

export const securityCurriculum = [build(securityBasics), build(securityCryptoWeb)];

export const securityFlatLessons = securityCurriculum.flatMap((section) =>
  section.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topic, section }))),
);

export const securityLessonPath = (item) => `/security/lesson/${item.section.id}/${item.topic.id}/${item.id}`;

export function getSecurityLesson(sectionId, topicId, lessonId) {
  return securityFlatLessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || securityFlatLessons[0];
}

// Модуль практики. Проект «Заметки» описан отдельно в project.js.
export const securityPlannedModules = [
  { id: "sec-practice", title: "Практика: исправь уязвимость", phase: "ПРАКТИКА", summary: "Девять задач с настоящим выполнением кода: инъекции, пароли, сессии, файлы, секреты, логи.", path: "/security/practice", ready: true },
];
