export function plural(count, one, few, many) {
  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export const lessonsLabel = (count) => `${count} ${plural(count, "урок", "урока", "уроков")}`;
export const topicsLabel = (count) => `${count} ${plural(count, "тема", "темы", "тем")}`;
export const modulesLabel = (count) => `${count} ${plural(count, "модуль", "модуля", "модулей")}`;
