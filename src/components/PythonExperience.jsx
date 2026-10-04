import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, MagnifyingGlass, Play,
  SlidersHorizontal, XCircle,
} from "@phosphor-icons/react";
import "../styles-sql.css";
import { CourseCabinet } from "./CourseCabinet.jsx";
import { checkSolution, runPythonProgram, assembleSource } from "../lib/pyodidePlayground.js";
import { recordPractice } from "../lib/activity.js";
import { pythonProjectTrack } from "../content/python/project.js";

export const pythonModules = [
  { n: "01", title: "Старт и базовый синтаксис", text: "Настройте Python, запустите первую программу и освойте переменные.", topics: ["Среда и первый запуск", "Переменные", "Числа и строки", "Ввод и вывод", "Функции"] },
  { n: "02", title: "Условия и циклы", text: "Научите программу принимать решения и обрабатывать последовательности.", topics: ["Условия if", "Булева логика", "Цикл for", "Цикл while", "range и enumerate"] },
  { n: "03", title: "Коллекции данных", text: "Работайте со списками, словарями, кортежами и множествами.", topics: ["Списки", "Словари", "Кортежи", "Множества", "Генераторы коллекций"] },
  { n: "04", title: "Файлы, модули и ошибки", text: "Разделяйте код, сохраняйте данные и спокойно обрабатывайте сбои.", topics: ["Импорт и модули", "Текстовые файлы", "JSON и CSV", "Исключения", "pip и зависимости"] },
  { n: "05", title: "Объектный подход", text: "Описывайте предметную область через классы и понятные контракты.", topics: ["Классы и объекты", "Атрибуты и методы", "Наследование", "Инкапсуляция", "Аннотации типов"] },
  { n: "06", title: "Проект: сервис отчётов", text: "Соберите CLI-сервис, который очищает данные и формирует отчёт.", topics: ["Бриф команды", "Декомпозиция", "Реализация", "Тесты", "README и релиз"] },
];

export const pythonChallenges = [
  {
    id: "clean-name", title: "Нормализация имени", category: "Строки", level: "Лёгкая", minutes: 7,
    description: "Очистите пробелы и приведите имя клиента к аккуратному виду.",
    starter: "def clean_name(value: str) -> str:\n    # ваш код\n    return value",
    harness: "print(repr(clean_name(\"  анна петрова  \")))\nprint(repr(clean_name(\"ИВАН\")))\nprint(repr(clean_name(\"\")))",
    referenceSolution: "def clean_name(value: str) -> str:\n    return value.strip().title()",
    hint: "Сначала используйте strip(), затем title().",
  },
  {
    id: "transaction-fee", title: "Комиссия операции", category: "Условия", level: "Лёгкая", minutes: 9,
    description: "Комиссия — 2% от суммы, но не меньше 50.",
    starter: "def fee(amount: float) -> float:\n    # ваш код\n    return 0",
    harness: "print(fee(100))\nprint(fee(10000))\nprint(fee(2500))",
    referenceSolution: "def fee(amount: float) -> float:\n    return max(amount * 0.02, 50.0)",
    hint: "Функция max поможет выбрать процент или минимальную комиссию.",
  },
  {
    id: "positive-total", title: "Сумма пополнений", category: "Списки", level: "Лёгкая", minutes: 10,
    description: "Сложите только положительные операции из списка.",
    starter: "def deposits(values: list[int]) -> int:\n    # ваш код\n    return 0",
    harness: "print(deposits([100, -50, 200, -10, 5]))\nprint(deposits([]))\nprint(deposits([-1, -2]))",
    referenceSolution: "def deposits(values: list[int]) -> int:\n    return sum(v for v in values if v > 0)",
    hint: "Передайте в sum генератор с условием value > 0.",
  },
  {
    id: "currency-counter", title: "Счётчик валют", category: "Словари", level: "Средняя", minutes: 14,
    description: "Посчитайте количество операций в каждой валюте.",
    starter: "def count_currencies(items: list[str]) -> dict[str, int]:\n    result = {}\n    # ваш код\n    return result",
    harness: "result = count_currencies([\"BTC\", \"ETH\", \"BTC\", \"USDT\", \"BTC\"])\nfor key in sorted(result):\n    print(key, result[key])",
    referenceSolution: "def count_currencies(items: list[str]) -> dict[str, int]:\n    result = {}\n    for item in items:\n        result[item] = result.get(item, 0) + 1\n    return result",
    hint: "Получайте текущее значение через dict.get(key, 0).",
  },
  {
    id: "parse-records", title: "Разбор JSON-операций", category: "JSON", level: "Средняя", minutes: 17,
    description: "Прочитайте JSON и верните только записи с полем amount. Невалидный JSON — пустой список.",
    starter: "import json\n\ndef parse_records(raw: str) -> list[dict]:\n    # ваш код\n    return []",
    harness: "print(len(parse_records('[{\"amount\": 100}, {\"note\": \"no amount\"}, {\"amount\": 50}]')))\nprint(parse_records('not json'))",
    referenceSolution: "import json\n\ndef parse_records(raw: str) -> list[dict]:\n    try:\n        data = json.loads(raw)\n    except json.JSONDecodeError:\n        return []\n    if not isinstance(data, list):\n        return []\n    return [item for item in data if isinstance(item, dict) and \"amount\" in item]",
    hint: "Используйте json.loads внутри try/except и перехватите JSONDecodeError.",
  },
  {
    id: "safe-rate", title: "Безопасный курс валют", category: "Ошибки", level: "Средняя", minutes: 16,
    description: "Переведите сумму по курсу. Неизвестная валюта — понятная ошибка, а не падение по KeyError.",
    starter: "def convert(amount: float, rates: dict, currency: str) -> float:\n    # ваш код\n    return 0",
    harness: "rates = {\"USD\": 90, \"EUR\": 98}\nprint(convert(10, rates, \"USD\"))\ntry:\n    convert(10, rates, \"GBP\")\nexcept ValueError as e:\n    print(\"caught:\", e)",
    referenceSolution: "def convert(amount: float, rates: dict, currency: str) -> float:\n    if currency not in rates:\n        raise ValueError(f\"unknown currency: {currency}\")\n    return amount * rates[currency]",
    hint: "Явно проверьте наличие валюты и поднимите ValueError с понятным текстом.",
  },
  {
    id: "wallet-class", title: "Модель кошелька", category: "Классы", level: "Средняя", minutes: 20,
    description: "Создайте класс кошелька с пополнением и списанием, без ухода в минус.",
    starter: "class Wallet:\n    def __init__(self, balance: int = 0):\n        # ваш код\n        pass",
    harness: "w = Wallet(100)\nw.deposit(50)\nprint(w.balance)\nprint(w.withdraw(30))\nprint(w.balance)\nprint(w.withdraw(1000))\nprint(w.balance)",
    referenceSolution: "class Wallet:\n    def __init__(self, balance: int = 0):\n        self.balance = balance\n\n    def deposit(self, amount: int) -> None:\n        self.balance += amount\n\n    def withdraw(self, amount: int) -> bool:\n        if amount > self.balance:\n            return False\n        self.balance -= amount\n        return True",
    hint: "Сохраните balance в экземпляре; withdraw должен возвращать False и не менять баланс, если денег не хватает.",
  },
  {
    id: "report-pipeline", title: "Конвейер отчёта", category: "Функции", level: "Сложная", minutes: 26,
    description: "Сгруппируйте операции по категории и верните отсортированный текстовый отчёт.",
    starter: "def build_report(rows: list[dict]) -> str:\n    # ваш код\n    return ''",
    harness: "rows = [{\"category\": \"food\", \"amount\": 100}, {\"category\": \"transport\", \"amount\": 40}, {\"category\": \"food\", \"amount\": 25}]\nprint(build_report(rows))\nprint(repr(build_report([])))",
    referenceSolution: "def build_report(rows: list[dict]) -> str:\n    totals: dict[str, int] = {}\n    for row in rows:\n        totals[row[\"category\"]] = totals.get(row[\"category\"], 0) + row[\"amount\"]\n    lines = [f\"{category}: {totals[category]}\" for category in sorted(totals)]\n    return \"\\n\".join(lines)",
    hint: "Разделите решение на группировку в словарь и сборку отсортированных строк.",
  },
  {
    id: "csv-summary", title: "Сводка из CSV", category: "Файлы", level: "Сложная", minutes: 28,
    description: "Прочитайте CSV-поток и соберите количество строк и сумму колонки amount.",
    starter: "import csv\n\ndef summarize(stream) -> dict:\n    # ваш код\n    return {}",
    harness: "import io\ncsv_text = \"amount\\n100\\n250\\n50\\n\"\nresult = summarize(io.StringIO(csv_text))\nprint(result[\"count\"], result[\"total\"])",
    referenceSolution: "import csv\n\ndef summarize(stream) -> dict:\n    reader = csv.DictReader(stream)\n    total = 0.0\n    count = 0\n    for row in reader:\n        total += float(row[\"amount\"])\n        count += 1\n    return {\"count\": count, \"total\": total}",
    hint: "Итерируйтесь по csv.DictReader построчно, не загружая всё содержимое заранее.",
  },
];

export const getPythonChallenge = (id) => pythonChallenges.find((item) => item.id === id) || pythonChallenges[0];

function PythonContextNav({ navigate, active }) {
  return <nav className="course-context-nav python-context" aria-label="Разделы курса Python"><button onClick={() => navigate("/")}><ArrowLeft size={16}/> Все направления</button><div><button className={active === "course" ? "active" : ""} onClick={() => navigate("/python")}>Курс Python</button><button className={active === "practice" ? "active" : ""} onClick={() => navigate("/python/practice")}>Практика</button></div></nav>;
}

export function PythonCoursePage({ navigate }) {
  return <CourseCabinet navigate={navigate} course={{ slug: "python", label: "Python", kicker: "АВТОМАТИЗАЦИЯ РАБОЧИХ ЗАДАЧ", title: "Python для рабочих задач", description: "От первой функции до сервиса подготовки отчётов и проекта в GitHub.", modules: pythonModules, phases: ["СТАРТ", "ЛОГИКА", "ДАННЫЕ", "ИНСТРУМЕНТЫ", "АРХИТЕКТУРА", "ПРОЕКТ"], practiceSummary: "Тренажёр Python с запуском кода", practiceHint: "Зато тренажёр Python уже работает и покрывает эти темы: код запускается в браузере, решение проверяется автоматически.", practicePath: "/python/practice", firstPath: "/python/practice", startLabel: "Открыть тренажёр Python", project: { title: pythonProjectTrack.project.title, summary: pythonProjectTrack.project.summary, includes: pythonProjectTrack.project.includes, path: "/python/project" } }}/>;
}

export function PythonTrainer({ navigate }) {
  const [query, setQuery] = useState(""); const [level, setLevel] = useState("Все"); const [category, setCategory] = useState("Все");
  const categories = ["Все", ...new Set(pythonChallenges.map((item) => item.category))];
  const filtered = useMemo(() => pythonChallenges.filter((item) => (level === "Все" || item.level === level) && (category === "Все" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())), [query, level, category]);
  return <main className="go-practice-shell python-practice-shell"><PythonContextNav navigate={navigate} active="practice"/><div className="go-trainer container"><header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · PYTHON</p><h1>Python-тренажёр</h1><p>Короткие задачи от строк и списков до файлов, классов и рабочего конвейера.</p></div><div className="trainer-progress-note"><CheckCircle size={20}/><span><b>Практика курса</b><small>Упражнения готовят к итоговому сервису, а не существуют отдельно.</small></span></div></header><section className="go-trainer-filters"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск Python-задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section><section className="go-task-list">{filtered.map((item, index) => <button onClick={() => navigate(`/python/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>)}</section></div></main>;
}

export function PythonTask({ challengeId, navigate }) {
  const challenge = getPythonChallenge(challengeId);
  const [code, setCode] = useState(challenge.starter);
  const [tab, setTab] = useState("result");
  const [showHint, setShowHint] = useState(false);
  const [run, setRun] = useState({ status: "idle", stdout: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  const withLoadMessage = async (action) => {
    setBusy(true);
    setTab("result");
    recordPractice("python");
    setLoadMessage("Загружаем Python в браузер (только при первом запуске)…");
    const timer = setTimeout(() => setLoadMessage("Выполняем код…"), 1500);
    try {
      await action();
    } finally {
      clearTimeout(timer);
      setBusy(false);
      setLoadMessage("");
    }
  };

  const execute = () => withLoadMessage(async () => {
    try {
      const result = await runPythonProgram(assembleSource(code, challenge.harness));
      setRun({ status: result.status === "ok" ? "ran" : result.status, stdout: result.stdout, message: result.message });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    }
  });

  const submit = () => withLoadMessage(async () => {
    try {
      const result = await checkSolution(challenge, code);
      setRun({
        status: result.status === "ok" ? (result.matched ? "success" : "mismatch") : result.status,
        stdout: result.stdout,
        message: result.message,
      });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    }
  });

  const resultTone = run.status === "success" ? "success" : ["mismatch", "compile-error", "runtime-error", "network-error"].includes(run.status) ? "error" : "";

  return <main className="sql-task-shell python-task-shell">
    <header><button onClick={() => navigate("/python/practice")}><ArrowLeft size={17}/> Все задачи</button><span>Python · Pyodide (CPython в браузере)</span><button onClick={() => navigate("/python")}>Программа курса</button></header>
    <div className="sql-task-grid">
      <section className="sql-task-brief">
        <p className="academy-kicker">{challenge.level.toUpperCase()} · {challenge.minutes} МИН · {challenge.category.toUpperCase()}</p>
        <h1>{challenge.title}</h1>
        <p>{challenge.description}</p>
        <button onClick={() => setShowHint((value) => !value)}>{showHint ? "Скрыть подсказку" : "Показать подсказку"}</button>
        {showHint && <aside>{challenge.hint}</aside>}
      </section>
      <section className="sql-editor">
        <div className="sql-editor-top"><b>solution.py</b><span>Pyodide</span></div>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="Редактор Python-кода"/>
        <div className="sql-runbar">
          <button onClick={() => setCode(challenge.starter)}>Сбросить</button>
          <button className="secondary" onClick={execute} disabled={busy}><Play size={15} weight="fill"/> Выполнить</button>
          <button className="primary" onClick={submit} disabled={busy}>Отправить <ArrowRight size={16}/></button>
        </div>
        <div className="sql-result-tabs">
          <button className={tab === "result" ? "active" : ""} onClick={() => setTab("result")}>Результат</button>
          <button className={tab === "harness" ? "active" : ""} onClick={() => setTab("harness")}>Что вызывается</button>
        </div>
        <div className={`sql-result ${resultTone}`}>
          {tab === "harness"
            ? <><header><b>Тестовый вызов</b><span>только для чтения</span></header><pre className="sql-error-text" style={{ color: "#b8efdb" }}>{challenge.harness}</pre></>
            : <>
                <header><b>Результат</b><span>{busy ? "Выполняется…" : run.status === "idle" ? "Предпросмотр" : run.status}</span></header>
                {busy && <p>{loadMessage}</p>}
                {!busy && run.status === "idle" && <p>Нажмите «Выполнить», чтобы увидеть вывод программы.</p>}
                {!busy && (run.status === "compile-error" || run.status === "runtime-error" || run.status === "network-error") && <pre className="sql-error-text">{run.message}</pre>}
                {!busy && (run.status === "ran" || run.status === "success" || run.status === "mismatch") && <pre className="sql-error-text" style={{ color: "#eaf4f0" }}>{run.stdout || "(пустой вывод)"}</pre>}
              </>}
          {run.status === "success" && <div className="sql-verdict success"><CheckCircle size={18}/> Верно — вывод совпал с эталонным решением.</div>}
          {run.status === "mismatch" && <div className="sql-verdict error"><XCircle size={18}/> Код выполнился, но вывод пока не совпадает. {challenge.hint}</div>}
        </div>
      </section>
    </div>
  </main>;
}
