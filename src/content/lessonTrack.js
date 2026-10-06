// Собирает конфиг уроков для TrackLesson: устойчивые id уроков и блоков,
// плоский список и пути. practice: null — после последнего урока ведём в проект.
export function buildLessonTrack({ slug, base, modules }) {
  const curriculum = modules.map((module) => ({
    ...module,
    topics: module.topics.map((topic) => ({
      ...topic,
      lessons: topic.lessons.map((lesson, index) => {
        const id = `${module.id}-${topic.id}-${index + 1}`;
        return { ...lesson, id, blocks: lesson.blocks.map((block, blockIndex) => ({ id: `${id}-b${blockIndex}`, ...block })) };
      }),
    })),
  }));
  const flatLessons = curriculum.flatMap((section) => section.topics.flatMap((topic) => topic.lessons.map((lesson) => ({ ...lesson, topic, section }))));
  const lessonPath = (item) => `${base}/lesson/${item.section.id}/${item.topic.id}/${item.id}`;
  return {
    slug, base, curriculum, flatLessons, lessonPath, practice: null,
    getLesson: (sectionId, topicId, lessonId) => flatLessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || flatLessons[0],
  };
}
