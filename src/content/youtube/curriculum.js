import { ytFoundations, ytCraft, ytGrowth } from "./modules.js";
import { ytProject } from "./project.js";

export const YT_SLUG = "youtube";
export const YT_PROJECT_SLUG = "youtube-project";

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

const curriculum = [build(ytFoundations), build(ytCraft), build(ytGrowth)];
const flatLessons = curriculum.flatMap((section) => section.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topic, section }))));

const base = "/youtube";
const stages = [
  { id: "overview", title: "О проекте", path: `${base}/project` },
  { id: "setup", title: "Подготовка", path: `${base}/project/setup` },
  ...ytProject.sprints.map((sprint) => ({ id: `sprint-${sprint.number}`, title: `Спринт ${sprint.number}`, path: `${base}/project/sprint/${sprint.number}` })),
];

export const youtubeTrack = {
  slug: YT_SLUG,
  practiceSlug: "youtube-practice",
  projectSlug: YT_PROJECT_SLUG,
  base,
  kicker: "YOUTUBE ДЛЯ НОВИЧКОВ",
  title: "YouTube с нуля",
  description: "Короткая теория по справке и блогу YouTube и проект: за четыре спринта вы публикуете пять полностью оформленных видео на своём канале.",
  curriculum,
  flatLessons,
  lessonPath: (item) => `${base}/lesson/${item.section.id}/${item.topic.id}/${item.id}`,
  getLesson: (sectionId, topicId, lessonId) => flatLessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || flatLessons[0],
  practice: null,
  project: { ...ytProject, stages },
};
