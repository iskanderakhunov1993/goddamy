import { getGoChallenge, goChallenges } from "../goChallenges.js";
import { goCoreTasks } from "./goCore.js";
import { dataModelTasks } from "./dataModel.js";
import { filesJsonTasks } from "./filesJson.js";
import { databaseBasicsTasks } from "./databaseBasics.js";
import { qualityTasks } from "./quality.js";

// Задания уроков курса Go: после теории урока идут 3–5 заданий, как в тренажёре
// Практикума по устройству. Задание — либо задача тренажёра ({ challenge: id }),
// либо своё код-задание (kind: "code") или вопрос (kind: "quiz").
// Темы Модуля 3 лежат в отдельных файлах; здесь они собираются в одну карту.
const topicSets = [goCoreTasks, dataModelTasks, filesJsonTasks, qualityTasks, databaseBasicsTasks];

// Уроки, у которых пока одна задача тренажёра. Файл темы, если он есть, их заменяет.
const singleTasks = {
  "go-foundations-go-core-1": "greeting",
  "go-foundations-go-core-2": "seconds",
  "go-foundations-go-core-3": "grade",
  "go-foundations-go-core-4": "factorial",
  "go-foundations-go-core-5": "safe-parse",
  "go-foundations-data-model-1": "book-card",
  "go-foundations-data-model-2": "sum-even",
  "go-foundations-data-model-3": "word-frequency",
  "go-foundations-data-model-4": "rename-task",
  "go-foundations-data-model-5": "counter-methods",
  "go-foundations-files-json-2": "json-backup",
  "sprint-bookmarks-api-server-3": "http-status",
};

const challengeIds = new Set(goChallenges.map((item) => item.id));

function normalize(task) {
  if (task.challenge) {
    const challenge = getGoChallenge(task.challenge);
    return { kind: "code", key: challenge.id, id: challenge.id, title: challenge.title, minutes: challenge.minutes, description: challenge.description, starter: challenge.starter, harness: challenge.harness, referenceSolution: challenge.referenceSolution, hint: challenge.hint };
  }
  return { minutes: task.kind === "quiz" ? 2 : 5, ...task, key: task.id };
}

export const lessonTasks = Object.fromEntries([
  ...Object.entries(singleTasks).filter(([, id]) => challengeIds.has(id)).map(([lessonId, id]) => [lessonId, [{ challenge: id }]]),
  ...topicSets.flatMap((set) => Object.entries(set)),
].map(([lessonId, tasks]) => [lessonId, tasks.map(normalize)]));

export const getLessonTasks = (lessonId) => lessonTasks[lessonId] || [];
