import { ArrowLeft, ArrowRight, Briefcase, ClipboardText, Kanban, UserFocus } from "@phosphor-icons/react";
import { CourseCabinet } from "./CourseCabinet.jsx";
import "../styles-business-courses.css";

export const productModules = [
  { n: "01", title: "Роль продуктового менеджера", text: "Поймите, за какой результат отвечает PM и как продукт связывает людей, данные и бизнес.", topics: ["Продукт и ценность", "Роль PM в команде", "Пользователь и его задача", "Метрики продукта", "Первый продуктовый бриф"] },
  { n: "02", title: "Пользователь и исследование", text: "Научитесь замечать проблему, формулировать гипотезу и разговаривать с пользователями.", topics: ["Сегменты аудитории", "JTBD", "Интервью", "Карта пути пользователя", "Формулировка инсайтов"] },
  { n: "03", title: "Метрики и решения", text: "Выбирайте метрики, читайте данные и не путайте корреляцию с причиной.", topics: ["Цель и North Star", "Воронка", "Retention", "Гипотеза", "Разбор результата"] },
  { n: "04", title: "Приоритизация и roadmap", text: "Собирайте план развития продукта из ограничений, возможностей и ценности.", topics: ["Backlog", "RICE", "Impact Mapping", "Roadmap", "Коммуникация решений"] },
  { n: "05", title: "Delivery с командой", text: "Превращайте продуктовую идею в ясную задачу для дизайна, разработки и QA.", topics: ["User story", "Acceptance criteria", "Декомпозиция", "Риски", "Проверка перед релизом"] },
  { n: "06", title: "Проект: запуск функции", text: "Проведите реальную рабочую историю: от проблемы до решения и ретроспективы.", topics: ["Бриф Bit Tech", "Исследование", "Гипотеза и метрики", "План поставки", "Защита решения"] },
];

export const qaModules = [
  { n: "01", title: "Роль QA в команде", text: "Разберитесь, как тестирование снижает риски и помогает команде выпускать надёжный продукт.", topics: ["Качество продукта", "Роль QA", "Жизненный цикл задачи", "Виды тестирования", "Рабочее окружение"] },
  { n: "02", title: "Требования и тест-дизайн", text: "Научитесь задавать вопросы к требованиям и строить проверки без лишних сценариев.", topics: ["Анализ требований", "Позитивные сценарии", "Граничные значения", "Классы эквивалентности", "Чек-лист"] },
  { n: "03", title: "Тест-кейсы и баг-репорты", text: "Фиксируйте проверку и ошибку так, чтобы команда могла быстро воспроизвести и исправить проблему.", topics: ["Структура тест-кейса", "Шаги и результат", "Приоритет и серьёзность", "Баг-репорт", "Повторная проверка"] },
  { n: "04", title: "Web и API", text: "Проверяйте интерфейсы, запросы и ответы сервисов в рабочих сценариях.", topics: ["Клиент и сервер", "HTTP-методы", "Коды ответа", "Postman", "Контракт API"] },
  { n: "05", title: "Регрессия и релиз", text: "Собирайте регрессионный набор и помогайте команде принимать решение о поставке.", topics: ["Smoke-проверка", "Регрессия", "Тестовый отчёт", "Релизные риски", "Ретроспектива"] },
  { n: "06", title: "Проект: проверка сервиса", text: "Пройдите путь QA в Bit Tech: требования, тест-дизайн, API-проверки и релизная рекомендация.", topics: ["Бриф QA", "Тестовая стратегия", "Проверка сценариев", "Дефекты", "Итоговый отчёт"] },
];

export function ProductCoursePage({ navigate }) {
  return <CourseCabinet navigate={navigate} course={{ slug: "product", label: "Product", kicker: "ПРОДУКТ · BIT TECH", title: "Product Management", description: "От пользовательской проблемы до решения, которое команда сможет выпустить и измерить.", modules: productModules, phases: ["СТАРТ", "ИССЛЕДОВАНИЕ", "МЕТРИКИ", "ПЛАН", "DELIVERY", "ПРОЕКТ"], role: "Текущая роль: junior product manager.", nextStep: "Разберите первый продуктовый бриф и оформите понятную гипотезу.", practicePath: "/product/practice", firstPath: "/product/practice", startLabel: "Начать обучение" }}/>;
}

export function QaCoursePage({ navigate }) {
  return <CourseCabinet navigate={navigate} course={{ slug: "qa", label: "QA", kicker: "КАЧЕСТВО · BIT TECH", title: "QA Engineer", description: "От анализа требований до проверки API и понятной рекомендации перед релизом.", modules: qaModules, phases: ["СТАРТ", "ДИЗАЙН", "ДЕФЕКТЫ", "API", "РЕЛИЗ", "ПРОЕКТ"], role: "Текущая роль: junior QA engineer.", nextStep: "Откройте задачу команды и составьте первый чек-лист проверок.", practicePath: "/qa/practice", firstPath: "/qa/practice/priority-vs-severity", startLabel: "Начать обучение" }}/>;
}

const practiceCopy = {
  product: { icon: <Briefcase size={33}/>, kicker: "ПРАКТИКА · PRODUCT", title: "Продуктовые кейсы готовятся", text: "Здесь появятся брифы Bit Tech: интервью, метрики, приоритизация и защита решений." },
};

export function BusinessPracticeComing({ navigate, course }) {
  const current = practiceCopy[course];
  const backPath = `/${course}`;
  return <main className="business-practice"><nav><button onClick={() => navigate(backPath)}><ArrowLeft size={17}/> К программе курса</button><span>{current.kicker}</span></nav><section><div className="business-practice-icon">{current.icon}</div><p>{current.kicker}</p><h1>{current.title}</h1><p>{current.text}</p><div className="business-practice-points"><span><ClipboardText size={19}/> Рабочие брифы</span><span><Kanban size={19}/> Решения по критериям</span><span><UserFocus size={19}/> Обратная связь</span></div><button onClick={() => navigate(backPath)}>Открыть программу <ArrowRight size={18}/></button></section></main>;
}
