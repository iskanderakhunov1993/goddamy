export const achievementDefs = [
  { id: "first-step", title: "Первый шаг", description: "Пройден первый урок курса.", check: (percent, completed) => completed >= 1 },
  { id: "steady-pace", title: "Держим темп", description: "Пройдено 10 уроков.", check: (percent, completed) => completed >= 10 },
  { id: "quarter-way", title: "Четверть пути", description: "Курс пройден на 25%.", check: (percent) => percent >= 25 },
  { id: "halfway", title: "Половина курса", description: "Курс пройден на 50%.", check: (percent) => percent >= 50 },
  { id: "three-quarters", title: "Финишная прямая", description: "Курс пройден на 75%.", check: (percent) => percent >= 75 },
  { id: "course-complete", title: "Курс завершён", description: "Курс пройден на 100%.", check: (percent) => percent >= 100 },
];

export function getUnlockedAchievements(percent, completed) {
  return achievementDefs.filter((item) => item.check(percent, completed));
}
