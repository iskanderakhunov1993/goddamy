import { k8sBasics } from "./k8sBasics.js";
import { kafkaBasics } from "./kafkaBasics.js";
import { k8sChallenges, getK8sChallenge } from "./challenges.js";

export const K8S_SLUG = "kubernetes";
export const K8S_PRACTICE_SLUG = "kubernetes-practice";
export const K8S_PROJECT_SLUG = "kubernetes-project";

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

const curriculum = [build(k8sBasics), build(kafkaBasics)];
const flatLessons = curriculum.flatMap((section) => section.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topic, section }))));

export const kubernetesTrack = {
  slug: K8S_SLUG,
  practiceSlug: K8S_PRACTICE_SLUG,
  projectSlug: K8S_PROJECT_SLUG,
  base: "/kubernetes",
  kicker: "KUBERNETES · KAFKA",
  title: "Kubernetes и Kafka",
  description: "Коротко о том, как устроены кластер и брокер сообщений, а затем практика: разбор манифестов и учебная модель Kafka, которые выполняются прямо в браузере.",
  curriculum,
  flatLessons,
  lessonPath: (item) => `/kubernetes/lesson/${item.section.id}/${item.topic.id}/${item.id}`,
  getLesson: (sectionId, topicId, lessonId) => flatLessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || flatLessons[0],
  practice: {
    title: "Практика: манифесты и Kafka",
    summary: "Двенадцать задач с настоящим выполнением кода: проверки манифестов, правила планировщика, партиции, группы, коммиты.",
    countLabel: "задач в тренажёре (выполняются в браузере)",
    kicker: "ТРЕНАЖЁР · KUBERNETES И KAFKA",
    heading: "Практика: Kubernetes и Kafka",
    intro: "Код выполняется прямо в браузере. Вы реализуете ту логику, которую внутри делают Kubernetes и Kafka, и сразу видите результат.",
    note: "Кластера в браузере нет: это учебная модель правил, а не запуск настоящего Kubernetes или Kafka",
    harnessHeader: "Код проверки (harness)",
    idleHint: "Нажмите «Выполнить», чтобы увидеть вывод вашего кода, или «Отправить» для проверки.",
    successText: "Вывод совпал с эталонным.",
    failText: "Вывод отличается от эталонного.",
    challenges: k8sChallenges,
    getChallenge: getK8sChallenge,
  },
  project: null,
  projectPlanned: {
    title: "Проект: Kafka в kind (в разработке)",
    summary: "Локальный кластер kind, брокер Kafka в StatefulSet, продюсер и потребитель. Ещё не собран и не проверен на реальном кластере, поэтому пока не открыт.",
    includesLine: "Проект с настоящим кластером — в разработке",
  },
};
