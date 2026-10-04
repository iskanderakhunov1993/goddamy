// Проект курса Python: консольный «Учёт расходов». Студент пишет его у себя,
// а проверяет скриптом public/python-expenses/check.py, который запускает сам.
// Эталонное решение — examples/python-expenses-solution (в git не попадает).

const sh = (code) => ({ type: "code", language: "bash", code });
const py = (code) => ({ type: "code", language: "python", code });
const sprintCheck = (n) => ({ type: "callout", tone: "info", title: `Проверка спринта ${n}`, text: `Запусти \`python check.py\` в папке проекта. Спринт готов, когда в разделе «Спринт ${n}» все пункты отмечены ✓. Пункты следующих спринтов пока могут не проходить.` });

const overview = { blocks: [
  { type: "heading", level: 2, text: "Задача" },
  { type: "paragraph", text: "Вы пишете консольное приложение для учёта личных расходов: добавить трату, посмотреть список, удалить ошибочную запись, получить отчёт за месяц и выгрузить данные в CSV для таблицы. Приложение работает **у вас на компьютере**, а готовность каждого спринта проверяет скрипт `check.py`." },
  { type: "heading", level: 2, text: "Контракт команд" },
  sh("python expenses.py add <сумма> <категория> [описание] [--date ГГГГ-ММ-ДД]\npython expenses.py list\npython expenses.py delete <id>\npython expenses.py summary [--month ГГГГ-ММ]\npython expenses.py export <файл.csv>"),
  { type: "list", items: [
    "Данные хранятся в `expenses.json` в текущей папке: список объектов с полями `id`, `amount`, `category`, `description`, `date`.",
    "`summary` печатает строки `категория: 150.00` и последней строкой `Итого: 1230.00` — ровно два знака после точки.",
    "`export` создаёт CSV с колонками `id,date,category,amount,description`.",
    "Любая ошибка (неверная сумма или дата, неизвестный id, неизвестная команда, повреждённый файл) — понятное сообщение и ненулевой код выхода. **Traceback пользователь видеть не должен.**",
  ] },
  { type: "heading", level: 2, text: "Четыре спринта" },
  { type: "list", items: [
    "**Спринт 1.** `add` и `list`, хранение в JSON, проверка ввода.",
    "**Спринт 2.** `delete`, устойчивость к ошибкам и повреждённому файлу.",
    "**Спринт 3.** Даты и отчёт `summary` по категориям и месяцам.",
    "**Спринт 4.** Экспорт в CSV, тесты, README, публикация на GitHub.",
  ] },
  { type: "callout", tone: "info", title: "Что нужно знать", text: "Функции, списки и словари, модули `json`, `argparse`, `datetime`, `csv` и исключения. Всё это тренируется в тренажёре Python; в каждом спринте есть короткие примеры." },
] };

const setup = { blocks: [
  { type: "heading", level: 2, text: "Подготовка" },
  { type: "list", items: [
    "Установите Python 3.10 или новее с python.org и проверьте: `python --version` (на macOS и Linux может быть `python3`).",
    "Создайте папку `expenses`, в ней пустой `expenses.py`, и репозиторий на GitHub.",
    "Скачайте `check.py` в ту же папку и запустите его — сейчас почти все проверки красные, это нормально.",
  ] },
  sh("mkdir expenses && cd expenses\ngit init\npython check.py"),
  { type: "callout", tone: "warning", title: "Не подглядывайте в check.py за ответом", text: "Скрипт открыт специально: в нём видно, что именно проверяется. Но решение он не подскажет — только поведение, которого ждёт пользователь." },
] };

const sprints = [
  { number: 1, title: "Добавление и список", time: "3–4 часа", goal: "Сохранять расходы в JSON и показывать их.", result: "работают add и list, неверный ввод отклоняется.",
    blocks: [
      { type: "heading", level: 2, text: "Что сделать" },
      { type: "list", items: [
        "Разбор команд через `argparse` с подкомандами (`add_subparsers`).",
        "Функции `load()` и `save(items)` для `expenses.json`. Нет файла — пустой список.",
        "`add`: сумма больше нуля, иначе ошибка; `id` = максимальный существующий + 1; дата — сегодня (`date.today().isoformat()`).",
        "`list`: понятное сообщение, если расходов нет.",
      ] },
      py("import argparse\n\nparser = argparse.ArgumentParser(prog=\"expenses\")\nsub = parser.add_subparsers(dest=\"command\", required=True)\nadd = sub.add_parser(\"add\")\nadd.add_argument(\"amount\")\nadd.add_argument(\"category\")\nadd.add_argument(\"description\", nargs=\"?\", default=\"\")\nargs = parser.parse_args([\"add\", \"250\", \"еда\", \"обед\"])\nprint(args.command, args.amount, args.category, args.description)"),
      { type: "callout", tone: "tip", title: "Ошибки без Traceback", text: "Заведите своё исключение `class AppError(Exception)`, бросайте его при неверном вводе, а в `if __name__ == \"__main__\":` ловите, печатайте сообщение в `sys.stderr` и делайте `sys.exit(1)`." },
      sprintCheck(1),
      { type: "task", title: "Готово, если", text: "Отметь, когда check.py показывает ✓ по всему спринту.", checklist: ["Спринт 1 в check.py полностью зелёный", "Сделан commit и push"] },
    ] },
  { number: 2, title: "Удаление и надёжность", time: "2–3 часа", goal: "Удалять расходы и не терять данные при ошибках.", result: "работает delete, повреждённый файл не перезаписывается.",
    blocks: [
      { type: "list", items: [
        "`delete <id>`: неизвестный id — ошибка, а не тихий успех.",
        "Повреждённый `expenses.json`: перехватите `json.JSONDecodeError`, сообщите и остановитесь **до** записи — иначе пользователь потеряет данные.",
        "Пишите файл атомарно: сначала во временный, потом `os.replace(tmp, path)`.",
      ] },
      py("import json\n\ntry:\n    json.loads(\"{сломано\")\nexcept json.JSONDecodeError as error:\n    print(\"файл повреждён:\", error)"),
      sprintCheck(2),
      { type: "task", title: "Готово, если", text: "Отметь, когда check.py показывает ✓ по спринтам 1 и 2.", checklist: ["Спринт 2 в check.py полностью зелёный", "Сделан commit и push"] },
    ] },
  { number: 3, title: "Даты и отчёты", time: "3–4 часа", goal: "Считать расходы по категориям и месяцам.", result: "summary с фильтром по месяцу и точными суммами.",
    blocks: [
      { type: "list", items: [
        "`add ... --date 2026-03-15`: проверяйте формат через `datetime.strptime(text, \"%Y-%m-%d\")`.",
        "`summary`: суммы по категориям и строка `Итого`. С `--month 2026-03` — только этот месяц; неверный месяц — ошибка.",
        "Деньги считайте через `Decimal`, а не `float`: иначе 0.1 + 0.2 даст 0.30000000000000004.",
      ] },
      py("from decimal import Decimal\n\nprint(0.1 + 0.2)\nprint(Decimal(\"0.1\") + Decimal(\"0.2\"))\nprint(f\"{Decimal('150'):.2f}\")"),
      sprintCheck(3),
      { type: "task", title: "Готово, если", text: "Отметь, когда check.py показывает ✓ по спринтам 1–3.", checklist: ["Спринт 3 в check.py полностью зелёный", "Сделан commit и push"] },
    ] },
  { number: 4, title: "Экспорт, тесты, релиз", time: "3–4 часа", goal: "Довести проект до состояния, которое не стыдно показать.", result: "export в CSV, тесты, README, репозиторий на GitHub.",
    blocks: [
      { type: "list", items: [
        "`export report.csv` через `csv.DictWriter` с колонками `id,date,category,amount,description`.",
        "Тесты в файле `test_expenses.py` на `unittest`: следующий id, отказ от неверных сумм, сумма за месяц. Запуск: `python -m unittest`.",
        "README: что делает приложение и пример каждой команды. `.gitignore`: `expenses.json` и `__pycache__/`.",
        "Положите `check.py` в репозиторий, чтобы проверку мог повторить любой.",
      ] },
      sh("python -m unittest\npython check.py\ngit tag v1.0.0 && git push --tags"),
      sprintCheck(4),
      { type: "task", title: "Готово, если", text: "check.py показывает «Итог: 27 из 27».", checklist: ["check.py: 27 из 27", "README и тесты в репозитории", "Тег v1.0.0 опубликован"] },
    ] },
];

const build = (id, page) => ({ ...page, id, blocks: page.blocks.map((block, index) => ({ id: `${id}-b${index}`, ...block })) });
const base = "/python";
const project = {
  title: "Проект · Учёт расходов",
  shortTitle: "Учёт расходов",
  summary: "Консольное приложение на Python за четыре спринта. Пишете у себя, проверяете скриптом check.py — 27 автоматических проверок.",
  includes: "Проект «Учёт расходов» с автопроверкой check.py",
  downloads: ["check.py"],
  downloadBase: "/python-expenses",
  overview: build("py-project-overview", overview),
  setup: build("py-project-setup", setup),
  sprints: sprints.map((sprint) => build(`py-project-s${sprint.number}`, sprint)),
};

export const pythonProjectTrack = {
  slug: "python",
  projectSlug: "python-project",
  base,
  project: {
    ...project,
    stages: [
      { id: "overview", title: "О проекте", path: `${base}/project` },
      { id: "setup", title: "Подготовка", path: `${base}/project/setup` },
      ...project.sprints.map((sprint) => ({ id: `sprint-${sprint.number}`, title: `Спринт ${sprint.number}`, path: `${base}/project/sprint/${sprint.number}` })),
    ],
  },
};
