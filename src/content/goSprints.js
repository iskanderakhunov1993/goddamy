// Спринты буткемпа Go: один спринт — один проект — одна рабочая неделя.
// Порядок шагов повторяет неделю в команде: задача от тимлида → материалы →
// работа → проверка и сдача по ссылке → ретроспектива.
// Задачи приходят от роли («Тимлид»), без имён, компании и сюжета (AGENTS.md).

export const sprintStages = [
  { id: "task", title: "Задача", hint: "Что нужно сделать" },
  { id: "learn", title: "Изучи", hint: "Теория и документация" },
  { id: "build", title: "Сделай", hint: "Доска и проект" },
  { id: "submit", title: "Сдай", hint: "Проверка и ссылка" },
  { id: "retro", title: "Ретро", hint: "Итоги спринта" },
];

const neighbourCode = `package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

// Visits считает посещения страниц. Мьютекс защищает map:
// запросы приходят одновременно.
type Visits struct {
	mu    sync.Mutex
	pages map[string]int
}

func (v *Visits) Add(page string) int {
	v.mu.Lock()
	defer v.mu.Unlock()
	v.pages[page]++
	return v.pages[page]
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func main() {
	visits := &Visits{pages: map[string]int{}}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /visits/{page}", func(w http.ResponseWriter, r *http.Request) {
		page := r.PathValue("page")
		writeJSON(w, http.StatusOK, map[string]any{"page": page, "count": visits.Add(page)})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("слушаю на :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}`;

const lessonPath = (topic, number) => `/go/lesson/sprint-bookmarks-api/${topic}/sprint-bookmarks-api-${topic}-${number}`;

export const goSprints = [
  {
    id: "bookmarks-api",
    number: 1,
    moduleId: "sprint-bookmarks-api",
    title: "Первый HTTP-сервер",
    project: "Bookmarks API",
    summary: "Ты пишешь сервис закладок: HTTP API на стандартной библиотеке Go, с тестами и автоматической проверкой на GitHub.",
    duration: "около недели",
    stack: ["Go", "net/http", "JSON", "sync.Mutex", "httptest", "GitHub Actions"],
    result: "Публичный репозиторий bookmarks-api: сервер, который проходит 41 проверку у тебя и на GitHub.",
    source: { title: "Похожие задачи на roadmap.sh", url: "https://roadmap.sh/backend/projects" },

    ticket: {
      key: "GO-1",
      from: "Тимлид",
      channel: "задача в трекере",
      title: "Сервис закладок: первая версия API",
      body: [
        "Мобильная команда делает экран «Закладки»: человек сохраняет ссылку и возвращается к ней позже. Им нужен сервис, который хранит закладки и отдаёт их приложению.",
        "Нужна первая версия. Базу данных пока не подключаем: закладки лежат в памяти, пока сервис работает. Сейчас важнее согласовать контракт и дать мобильной команде рабочий адрес, чтобы они начали интеграцию.",
        "Контракт ниже уже согласован с мобильной командой, менять его нельзя. Пишем на стандартной библиотеке, без фреймворков.",
      ],
      acceptance: [
        "Все маршруты работают так, как описано в контракте",
        "Ошибки приходят в формате {\"error\": \"...\"} с кодами 400, 404 и 405",
        "Сервис выдерживает одновременные запросы и не теряет данные",
        "Есть тесты хэндлеров, go test ./... проходит",
        "README объясняет, как запустить сервис и какие у него маршруты",
        "Проверка в GitHub Actions зелёная",
      ],
      outOfScope: [
        "База данных и файлы: после перезапуска список пустой",
        "Регистрация и вход",
        "Поиск, фильтры и разбивка на страницы",
        "Фреймворки и сторонние библиотеки",
      ],
    },

    contract: {
      routes: [
        { method: "GET", path: "/health", success: "200 {\"status\": \"ok\"}", errors: "" },
        { method: "POST", path: "/bookmarks", success: "201 и созданная закладка", errors: "400 — не JSON, пустой title, url без http:// или https://" },
        { method: "GET", path: "/bookmarks", success: "200 и массив в порядке создания. Пустой список — []", errors: "" },
        { method: "GET", path: "/bookmarks/{id}", success: "200 и закладка", errors: "404 — нет такой закладки, 400 — id не число" },
        { method: "PUT", path: "/bookmarks/{id}", success: "200 и изменённая закладка", errors: "404, 400 — как у POST и GET" },
        { method: "DELETE", path: "/bookmarks/{id}", success: "204 без тела", errors: "404 — нет такой закладки" },
      ],
      bodyExample: "{\"url\": \"https://go.dev\", \"title\": \"Go\"}",
      objectExample: "{\"id\": 1, \"url\": \"https://go.dev\", \"title\": \"Go\", \"created_at\": \"2026-01-02T15:04:05Z\"}",
      errorExample: "{\"error\": \"title не может быть пустым\"}",
      rules: [
        "Сервер слушает порт из переменной окружения `PORT`. Если она не задана — 8080.",
        "У каждой закладки свой `id`. Они растут, а `id` удалённой закладки заново не выдаётся.",
        "`created_at` ставит сервер при создании. `PUT` меняет `url` и `title`, но не `id` и не `created_at`.",
        "Каждый ответ с телом идёт с заголовком `Content-Type: application/json`.",
        "Неподдерживаемый метод на существующем пути — код 405.",
      ],
    },

    docs: [
      { title: "net/http — документация пакета", url: "https://pkg.go.dev/net/http", note: "Server, ServeMux, Request, ResponseWriter" },
      { title: "Routing Enhancements for Go 1.22", url: "https://go.dev/blog/routing-enhancements", note: "маршруты с методом и {id}" },
      { title: "encoding/json — документация пакета", url: "https://pkg.go.dev/encoding/json", note: "разбор тела запроса и сборка ответа" },
      { title: "net/http/httptest", url: "https://pkg.go.dev/net/http/httptest", note: "тесты хэндлеров без сети" },
      { title: "Data Race Detector", url: "https://go.dev/doc/articles/race_detector", note: "как читать отчёт детектора гонок" },
      { title: "Go by Example: HTTP Server", url: "https://gobyexample.com/http-servers", note: "короткий пример сервера" },
      { title: "MDN: коды ответа HTTP", url: "https://developer.mozilla.org/ru/docs/Web/HTTP/Status", note: "справочник по кодам" },
    ],

    theory: [
      { topic: "http", title: "Как устроен HTTP", lessons: 3 },
      { topic: "server", title: "Сервер на Go", lessons: 5 },
      { topic: "delivery", title: "Тесты и поставка", lessons: 3 },
    ],

    neighbour: {
      title: "Счётчик посещений",
      intro: "Соседняя команда недавно выпустила маленький сервис: он считает, сколько раз открыли каждую страницу сайта. Задача другая, но приёмы те же, что понадобятся тебе.",
      code: neighbourCode,
      takeaways: [
        "Данные и мьютекс лежат в одной структуре, работа с ними идёт только через метод",
        "Ответ собирает одна функция writeJSON: заголовок, код, тело",
        "Маршрут записан вместе с методом, параметр пути читается через r.PathValue",
        "Порт приходит из переменной окружения PORT",
      ],
      gaps: "Чего в примере нет: проверки входных данных, ошибок в едином формате, тестов и таймаутов сервера. В твоём сервисе всё это нужно.",
    },

    setup: [
      { id: "repo", title: "Создать публичный репозиторий bookmarks-api на GitHub", explanation: "Без README и .gitignore: пустой репозиторий проще связать с локальной папкой.", command: "", verification: "Репозиторий открывается по адресу github.com/<твой логин>/bookmarks-api.", commonError: "Репозиторий создан закрытым (Private): проверку по ссылке он не пройдёт." },
      { id: "clone", title: "Клонировать репозиторий и создать модуль", explanation: "Имя модуля совпадает с адресом репозитория.", command: "git clone https://github.com/<логин>/bookmarks-api.git\ncd bookmarks-api\ngo mod init github.com/<логин>/bookmarks-api", verification: "В папке появился go.mod со строкой go 1.22 или новее.", commonError: "В go.mod стоит версия ниже 1.22: маршруты с методом работать не будут." },
      { id: "files", title: "Положить в репозиторий два файла проверки", explanation: "check.go — в корень проекта. godemy-check.yml — в папку .github/workflows. Файлы не меняй: при сдаче они сверяются с файлами курса.", command: "mkdir -p .github/workflows", verification: "git status показывает check.go и .github/workflows/godemy-check.yml.", commonError: "Файл workflow лежит в корне проекта, а не в .github/workflows." },
      { id: "first-commit", title: "Сделать первый commit и push", explanation: "Проверка на GitHub запустится и будет красной. Так и должно быть: сервера ещё нет.", command: "git add .\ngit commit -m \"chore: initialize project\"\ngit push -u origin main", verification: "На вкладке Actions появился запуск «Godemy check».", commonError: "Локальная ветка называется master, а на GitHub — main." },
    ],

    files: [
      { id: "check", name: "check.go", path: "check.go", href: "/go-sprints/bookmarks-api/check.go", note: "положи в корень проекта" },
      { id: "workflow", name: "godemy-check.yml", path: ".github/workflows/godemy-check.yml", href: "/go-sprints/bookmarks-api/godemy-check.yml", note: "положи в .github/workflows" },
    ],
    workflowPath: ".github/workflows/godemy-check.yml",
    checkTotal: 41,

    // Карточки доски совпадают с шагами отчёта check.go.
    tasks: [
      {
        id: "server",
        title: "Сервер и /health",
        text: "Сервер стартует на порту из PORT и отвечает на GET /health.",
        lessons: [["Первый сервер на net/http", lessonPath("server", 1)], ["Запуск: PORT, таймауты и структура проекта", lessonPath("delivery", 2)]],
        hints: ["Начни с одного файла main.go: маршрутизатор, один хэндлер, запуск.", "Заведи функцию writeJSON сразу. Она понадобится в каждом хэндлере."],
      },
      {
        id: "create-list",
        title: "Создание и список",
        text: "POST /bookmarks создаёт закладку, GET /bookmarks отдаёт все.",
        lessons: [["JSON и контракт API", lessonPath("http", 3)], ["JSON на входе и на выходе", lessonPath("server", 3)]],
        hints: ["Опиши структуру закладки с JSON-тегами ровно как в контракте.", "Хранилище — отдельная структура с методами Create и List. Счётчик следующего id живёт в ней же.", "Проверь пустой список: в ответе должно быть [], а не null."],
      },
      {
        id: "one",
        title: "Чтение, изменение, удаление",
        text: "GET, PUT и DELETE для /bookmarks/{id}.",
        lessons: [["Маршруты: метод и путь", lessonPath("server", 2)], ["Методы и коды ответа", lessonPath("http", 2)]],
        hints: ["Разбор id из пути повторяется в трёх хэндлерах. Вынеси его в функцию.", "Хранилище возвращает ошибку «не найдено», а код 404 выбирает хэндлер.", "На DELETE достаточно w.WriteHeader(http.StatusNoContent): тела нет."],
      },
      {
        id: "errors",
        title: "Ошибки",
        text: "Проверка входных данных и ответы 400, 404, 405 в одном формате.",
        lessons: [["Ошибки: один формат на весь сервис", lessonPath("server", 4)]],
        hints: ["Проверку url удобно делать через url.Parse: посмотри на поля Scheme и Host.", "POST и PUT проверяют тело одинаково. Пусть это будет одна функция.", "Код 405 маршрутизатор отдаёт сам, если в маршрутах указан метод."],
      },
      {
        id: "concurrency",
        title: "Одновременные запросы",
        text: "Сто запросов сразу не теряют данные и не роняют сервер.",
        lessons: [["Общие данные и sync.Mutex", lessonPath("server", 5)]],
        hints: ["Мьютекс закрывается в каждом методе хранилища, включая чтение.", "Запусти сервер командой go run -race . и отправь несколько запросов: детектор покажет строку с гонкой.", "Из List возвращай копию слайса, а не сам слайс хранилища."],
      },
      {
        id: "quality",
        title: "Тесты, README и CI",
        text: "Тесты хэндлеров, README и зелёная проверка на GitHub.",
        lessons: [["Тесты хэндлеров: httptest", lessonPath("delivery", 1)], ["GitHub Actions: проверка на каждый push", lessonPath("delivery", 3)]],
        hints: ["Вынеси сборку маршрутов в функцию, которая возвращает http.Handler: её вызовут и main, и тест.", "В README нужны три вещи: команда запуска, переменная PORT и список маршрутов.", "Перед push запусти gofmt -l . и go vet ./... — проверка смотрит на оба."],
      },
    ],

    retro: [
      { id: "worked", question: "Что получилось?", placeholder: "Что работает и что из этого радует больше всего" },
      { id: "blockers", question: "Что мешало?", placeholder: "Факт, что уже пробовалось и что помогло. Например: «сервер падал под нагрузкой — помог запуск с -race»" },
      { id: "next", question: "Что сделаю иначе в следующем спринте?", placeholder: "Одно конкретное изменение" },
    ],

    next: {
      title: "Спринт 2 · Task Tracker CLI",
      text: "Следующий проект совсем другой: консольное приложение без сети. Команды, аргументы, хранение в файле и релиз на GitHub.",
      path: "/go/lesson/project-task-tracker/task-discovery/project-task-tracker-task-discovery-1",
    },

    learned: [
      "Читать контракт API и делать сервис, который ему соответствует",
      "Поднимать HTTP-сервер на стандартной библиотеке Go",
      "Принимать и отдавать JSON с правильными кодами ответа",
      "Проверять входные данные и отвечать ошибками в одном формате",
      "Защищать общие данные мьютексом и находить гонки детектором",
      "Тестировать хэндлеры без запуска сервера",
      "Настраивать автоматическую проверку в GitHub Actions",
    ],
  },
];

export const getGoSprint = (id) => goSprints.find((sprint) => sprint.id === id) || null;
export const getGoSprintByModule = (moduleId) => goSprints.find((sprint) => sprint.moduleId === moduleId) || null;
export const sprintPath = (sprint, stage = "task") => `/go/sprint/${sprint.id}${stage === "task" ? "" : `/${stage}`}`;
