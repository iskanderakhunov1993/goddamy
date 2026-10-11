// Подписи состояния запуска кода в тренажёрах — одни и те же для всех курсов.
const LABELS = {
  idle: "Ещё не запускалось",
  ran: "Выполнено",
  success: "Решение принято",
  mismatch: "Ответ не совпал",
  "compile-error": "Ошибка в коде",
  "runtime-error": "Ошибка при выполнении",
  "syntax-error": "Ошибка в запросе",
  "network-error": "Не удалось выполнить",
};

export const runStatusLabel = (status) => LABELS[status] || "Выполнено";
