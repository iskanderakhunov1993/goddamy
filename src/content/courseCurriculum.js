import { lessonContent } from "./lessonContent/index.js";

const uid = (section, topic, index) => `${section}-${topic}-${index + 1}`;

const lesson = (section, topic, index, title, context) => {
  const id = uid(section.id, topic.id, index);
  const custom = lessonContent[id];
  if (custom) {
    return {
      id,
      title,
      summary: custom.summary,
      objectives: custom.objectives,
      blocks: custom.blocks.map((block, blockIndex) => ({ id: `${id}-b${blockIndex}`, ...block })),
    };
  }
  return {
    id,
    title,
    summary: context.summary || `Разберём «${title}» и сразу свяжем тему с работой над продуктом Bit Tech.`,
    objectives: [
      `Объяснить, зачем в проекте нужен подход «${title}»`,
      "Применить идею в своей ветке и проверить результат",
      "Зафиксировать следующий рабочий шаг в GitHub",
    ],
    blocks: [
      { id: `${id}-brief`, type: "callout", tone: "info", title: `${context.person || "Рома"} · ${context.role || "команда Bit Tech"}`, text: context.message || "В работе важен не идеальный ответ с первого раза, а понятный следующий шаг и проверяемый результат." },
      { id: `${id}-why`, type: "heading", level: 2, text: "Зачем это нужно в работе" },
      { id: `${id}-copy`, type: "paragraph", text: `${context.summary || `Тема «${title}»`} нужна, чтобы уверенно двигаться по проекту. Сначала разберите принцип на маленьком примере, затем перенесите его в свой репозиторий. Не копируйте решение: фиксируйте гипотезу, запускайте проверку и улучшайте результат.` },
      { id: `${id}-task`, type: "task", title: "Мини-шаг в репозитории", text: `Сделайте небольшой проверяемый шаг по теме «${title}». После выполнения сохраните результат отдельным осмысленным commit.`, checklist: ["Сформулировал, что изменяю", "Проверил командой или тестом", "Сделал commit по соглашению"] },
    ],
  };
};

const makeTopic = (section, id, title, lessons, context) => ({
  id,
  title,
  lessons: lessons.map((lessonTitle, index) => lesson(section, { id, title }, index, lessonTitle, context)),
});

const makeModule = (id, title, phase, summary, context, topics) => {
  const section = { id, title, phase, summary };
  return { ...section, topics: topics.map(([topicId, topicTitle, lessons]) => makeTopic(section, topicId, topicTitle, lessons, context)) };
};

export const courseExperience = {
  company: "Bit Tech",
  title: "Go Backend Internship",
  promise: "Практическая программа, которая помогает собрать базу для старта на позиции Junior Go Developer.",
  projects: [
    { id: "task-tracker", moduleId: "project-task-tracker", title: "Task Tracker CLI", level: "Проект 1", stack: ["Go", "Git", "GitHub", "JSON", "Unit tests"], result: "Консольное приложение для управления задачами с сохранением в JSON и GitHub Release.", checks: ["Сборка", "CRUD задач", "JSON", "Тесты", "README", "Release"] },
    { id: "expense-tracker", moduleId: "project-expense-tracker", title: "Expense Tracker", level: "Проект 2", stack: ["Go", "PostgreSQL", "SQL", "HTTP", "Migrations"], result: "Backend-сервис учёта расходов с категориями, отчётами и PostgreSQL.", checks: ["Схема БД", "CRUD", "Отчёты", "Миграции", "API", "Тесты"] },
    { id: "url-shortener", moduleId: "project-url-shortener", title: "URL Shortener API", level: "Проект 3", stack: ["Go", "REST API", "PostgreSQL", "Docker", "GitHub Actions"], result: "API коротких ссылок с редиректом, сроком действия, Docker Compose и CI.", checks: ["HTTP API", "Редирект", "PostgreSQL", "Docker", "CI", "Release"] },
  ],
  achievements: [
    { id: "first-commit", title: "Первый commit", description: "Первое осмысленное изменение в Git.", condition: "Первый push" },
    { id: "clean-build", title: "Чистая сборка", description: "Проект собирается и проходит базовую проверку.", condition: "go build и go vet" },
    { id: "test-defender", title: "Защитник тестов", description: "Ключевая логика покрыта unit-тестами.", condition: "go test ./..." },
    { id: "data-keeper", title: "Хранитель данных", description: "Данные переживают перезапуск приложения.", condition: "JSON или PostgreSQL" },
    { id: "container-ready", title: "Контейнер готов", description: "Сервис запускается вместе с БД.", condition: "docker compose up" },
    { id: "release-owner", title: "Релиз доставлен", description: "Проект оформлен для демонстрации.", condition: "GitHub Release" },
  ],
};

export const courseCurriculum = [
  makeModule("internship-start", "Старт", "ОНБОРДИНГ", "Познакомься с Bit Tech, устройством работы в IT и настрой рабочее место.", { person: "Оля", role: "HR Bit Tech", message: "Ты в экспериментальной pre-junior стажировке. Договоримся так: маленькие шаги, честные проверки и вопросы до того, как они станут проблемой." }, [
    ["welcome", "Добро пожаловать", ["Привет!", "Для кого курс", "Кто такие Go-разработчики?", "Как устроено обучение", "Подробнее о курсе", "Трудоустройство"]],
    ["it-process", "Как устроена работа в IT", ["Что такое IT-продукт", "Фича: от идеи до кода", "Agile и Scrum на практике", "Роли в IT-команде", "Инструменты команды"]],
    ["setup", "Настрой рабочее окружение", ["Терминал без страха", "Устанавливаем Go и VS Code", "Git на твоём компьютере", "Аккаунт и репозиторий на GitHub", "Где искать документацию"]],
  ]),
  makeModule("go-foundations", "База Go и инженерный подход", "ПОДГОТОВКА", "Освой язык и практики, которые понадобятся в первом проекте.", { person: "Рома", role: "тимлид Go-команды", message: "Не нужно запоминать весь Go. Нужно научиться находить нужный инструмент, писать маленькие функции и проверять их." }, [
    ["go-core", "Основа Go-программы", ["Пакеты и функция main", "Переменные и типы", "Условия и switch", "Циклы и range", "Функции и возврат ошибок"]],
    ["data-model", "Данные в Go", ["Структуры и поля", "Слайсы и append", "map и поиск данных", "Указатели на практике", "Методы и ответственность"]],
    ["files-json", "Файлы, JSON и конфигурация", ["Чтение и запись файлов", "Сериализация JSON", "Теги структур", "Обработка повреждённых данных", "Конфигурация через env"]],
    ["quality", "Тесты и качество", ["Первый unit-тест", "Табличные тесты", "Граничные сценарии", "gofmt и go vet", "Отладка и полезные ошибки"]],
    ["database-basics", "Основы PostgreSQL", ["Реляционные данные и SQL", "Таблицы и ограничения", "SELECT, INSERT, UPDATE, DELETE", "Миграции схемы", "Подключение Go к PostgreSQL"]],
  ]),
  makeModule("project-task-tracker", "Проект 1 · Task Tracker CLI", "ПРОЕКТ 1", "Собери консольный трекер задач: от требования Юли до релиза на GitHub.", { person: "Юля", role: "product manager", message: "Команде нужен простой Task Tracker для внутренних задач. Важнее понятный сценарий пользователя и надёжное сохранение данных, чем количество функций." }, [
    ["task-discovery", "Требование и декомпозиция", ["Рабочая ситуация", "Функциональные требования", "Что не входит в первую версию", "Модель Task", "План реализации и Definition of Done"]],
    ["task-cli", "CLI и управление задачами", ["Команды приложения", "Добавление задачи", "Просмотр списка", "Поиск по ID", "Изменение статуса"]],
    ["task-storage", "Сохранение в JSON", ["Контракт хранилища", "Запись списка задач", "Загрузка при старте", "Первый запуск без файла", "Ошибки и резервная копия"]],
    ["task-tests", "Проверка качества", ["Тесты бизнес-логики", "Тесты ошибок", "Проверка CLI вручную", "Саморевью Pull Request", "QA-отчёт Игоря"]],
    ["task-release", "Сдача первого проекта", ["README для нового разработчика", "Сборка бинарного файла", "Версия и Git tag", "GitHub Release", "Ретроспектива Task Tracker"]],
  ]),
  makeModule("project-expense-tracker", "Проект 2 · Expense Tracker", "ПРОЕКТ 2", "Создай сервис расходов с PostgreSQL, миграциями, API и отчётами.", { person: "Игорь", role: "QA engineer", message: "Во втором проекте проверяем не только счастливый путь. Деньги, даты и категории должны вести себя предсказуемо в каждой ошибочной ситуации." }, [
    ["expense-discovery", "Домен расходов", ["Проблема пользователя", "Категории и денежные суммы", "Дата операции и период", "Декомпозиция на пользовательские сценарии", "Схема данных"]],
    ["expense-logic", "Бизнес-логика", ["Валидация расходов", "Создание и редактирование", "Фильтрация по периоду", "Отчёт по категориям", "Ошибки предметной области"]],
    ["expense-postgres", "PostgreSQL в проекте", ["Миграции и таблицы", "Репозиторий PostgreSQL", "Параметризованные запросы", "Транзакции", "Индексы и объяснение запроса"]],
    ["expense-api", "HTTP API", ["net/http и маршруты", "JSON-запрос и ответ", "HTTP-статусы", "Валидация request body", "Проверка API через curl"]],
    ["expense-delivery", "Приёмка второго проекта", ["Интеграционные тесты", "Документация API", "Переменные окружения", "Pull Request и review", "Ретроспектива Expense Tracker"]],
  ]),
  makeModule("project-url-shortener", "Проект 3 · URL Shortener API", "ПРОЕКТ 3", "Доведи backend-сервис до релиза: API, PostgreSQL, Docker и CI.", { person: "Женя", role: "DevOps engineer", message: "Сервис считается готовым, когда его может запустить другой человек по README. Контейнер и CI — часть продукта, а не украшение после кода." }, [
    ["shortener-discovery", "Требование сервиса ссылок", ["Бизнес-сценарий коротких ссылок", "Создание короткого кода", "Редирект пользователя", "Срок действия ссылки", "Критерии приёмки API"]],
    ["shortener-http", "REST API на Go", ["Структура HTTP-сервера", "Handlers и зависимости", "Маршруты создания и получения", "Middleware и логирование", "Контракт ошибок API"]],
    ["shortener-data", "Данные и надёжность", ["Таблица ссылок и миграции", "Уникальность короткого кода", "Работа с PostgreSQL", "Статистика переходов", "Контекст и таймауты"]],
    ["shortener-delivery", "Docker и CI", ["Dockerfile Go-сервиса", "Docker Compose с PostgreSQL", "Healthcheck и логи", "GitHub Actions для Go", "Автопроверка commit"]],
    ["shortener-release", "Финальная поставка", ["Безопасность конфигурации", "Нагрузочные риски", "OpenAPI и README", "Release кандидата", "Ретроспектива URL Shortener"]],
  ]),
  makeModule("graduation", "Релиз, портфолио и завершение стажировки", "ФИНАЛ", "Собери артефакты, пройди финальную проверку и получи сертификат Godemy.", { person: "Роман Аркадьевич", role: "руководитель направления", message: "Ценность разработчика видна в результате: понятный код, проверяемый сервис, прозрачная история изменений и способность объяснить принятые решения." }, [
    ["team-flow", "Командный процесс", ["Issue как договорённость", "Ветка под задачу", "Pull Request и описание", "Саморевью перед merge", "Как отвечать на feedback"]],
    ["release-practice", "Готовность к поставке", ["Definition of Done", "Чистый клон репозитория", "Проверка Docker Compose", "Проверка CI", "План отката и известные ограничения"]],
    ["portfolio", "Три проекта в портфолио", ["Карточка Task Tracker", "Карточка Expense Tracker", "Карточка URL Shortener", "Демонстрация проекта", "Описание навыков без преувеличений"]],
    ["career", "Junior-ready профиль", ["Как читать вакансию", "Технический рассказ о проекте", "Типовые вопросы по Go", "План дальнейшей практики", "Следующий учебный маршрут"]],
    ["certificate", "Финальная приёмка", ["Проверка трёх репозиториев", "Командная ретроспектива", "Достижения стажировки", "Сертификат Godemy", "Завершение программы"]],
  ]),
];

export const flatLessons = courseCurriculum.flatMap((section) =>
  section.topics.flatMap((courseTopic) => courseTopic.lessons.map((item) => ({ ...item, topic: courseTopic, section }))),
);

export function getLesson(sectionId, topicId, lessonId) {
  return flatLessons.find((item) => item.section.id === sectionId && item.topic.id === topicId && item.id === lessonId) || flatLessons[0];
}

export function getLessonPath(item) {
  return `/go/lesson/${item.section.id}/${item.topic.id}/${item.id}`;
}
