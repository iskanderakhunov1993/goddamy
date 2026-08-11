import { useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, BracketsCurly, CheckCircle, Code,
  GitBranch, MagnifyingGlass, RocketLaunch, ShieldCheck, SlidersHorizontal,
  Stack, TerminalWindow,
} from "@phosphor-icons/react";
import { courseCurriculum } from "../content/courseCurriculum.js";
import "../styles-academy.css";

export const goChallenges = [
  { id: "sum-even", title: "Сумма чётных чисел", category: "Слайсы", level: "Лёгкая", minutes: 8, description: "Напишите функцию, которая складывает только чётные значения слайса.", starter: "package main\n\nfunc SumEven(nums []int) int {\n\t// ваш код\n\treturn 0\n}", successToken: "sum +=", hint: "Используйте range и проверку n % 2 == 0." },
  { id: "word-frequency", title: "Частотный словарь", category: "Map", level: "Лёгкая", minutes: 12, description: "Посчитайте, сколько раз каждое слово встретилось в сообщении пользователя.", starter: "package main\n\nfunc WordFrequency(words []string) map[string]int {\n\tresult := make(map[string]int)\n\t// ваш код\n\treturn result\n}", successToken: "result[", hint: "Map удобно использовать как счётчик: увеличивайте значение по ключу." },
  { id: "task-status", title: "Статус задачи по ID", category: "Структуры", level: "Лёгкая", minutes: 14, description: "Найдите задачу в слайсе структур и измените её статус.", starter: "package main\n\ntype Task struct { ID int; Status string }\n\nfunc SetStatus(tasks []Task, id int, status string) error {\n\t// ваш код\n\treturn nil\n}", successToken: "tasks[i]", hint: "Итерируйтесь по индексу, если хотите изменить элемент слайса." },
  { id: "expense-total", title: "Отчёт по категориям", category: "Map", level: "Средняя", minutes: 18, description: "Соберите суммы расходов по категориям для еженедельного отчёта.", starter: "package main\n\ntype Expense struct { Category string; Amount int }\n\nfunc Totals(items []Expense) map[string]int {\n\t// ваш код\n\treturn nil\n}", successToken: "totals[", hint: "Сначала создайте map, затем накапливайте сумму по Category." },
  { id: "safe-parse", title: "Безопасный разбор команды", category: "Ошибки", level: "Средняя", minutes: 16, description: "Проверьте пользовательскую команду и верните понятную ошибку вместо panic.", starter: "package main\n\nfunc ParseCommand(input string) (string, error) {\n\t// ваш код\n\treturn \"\", nil\n}", successToken: "errors.New", hint: "Опишите невалидный сценарий через errors.New или fmt.Errorf." },
  { id: "json-backup", title: "JSON-резервная копия", category: "JSON", level: "Средняя", minutes: 20, description: "Сериализуйте список задач и корректно сообщите о повреждённом файле.", starter: "package main\n\nfunc LoadTasks(data []byte) ([]string, error) {\n\t// ваш код\n\treturn nil, nil\n}", successToken: "json.Unmarshal", hint: "Используйте encoding/json и возвращайте ошибку вызывающему коду." },
  { id: "http-status", title: "HTTP-ответ для API", category: "HTTP", level: "Средняя", minutes: 18, description: "Верните JSON-ответ и правильный статус для создания расхода.", starter: "package main\n\nfunc CreateExpense(w http.ResponseWriter, r *http.Request) {\n\t// ваш код\n}", successToken: "http.StatusCreated", hint: "Для созданного ресурса используйте 201 Created." },
  { id: "worker-pool", title: "Мини worker pool", category: "Конкурентность", level: "Сложная", minutes: 28, description: "Распределите обработку ссылок между несколькими воркерами.", starter: "package main\n\nfunc Process(jobs []string, workers int) []string {\n\t// ваш код\n\treturn nil\n}", successToken: "go func", hint: "Начните с канала jobs и одной горутины-воркера." },
  { id: "request-timeout", title: "Таймаут внешнего запроса", category: "Context", level: "Сложная", minutes: 24, description: "Добавьте deadline к операции, чтобы сервис не зависал на внешнем API.", starter: "package main\n\nfunc Fetch(ctx context.Context, url string) error {\n\t// ваш код\n\treturn nil\n}", successToken: "context.WithTimeout", hint: "Создайте дочерний контекст и не забудьте вызвать cancel." },
];

export const getGoChallenge = (id) => goChallenges.find((item) => item.id === id) || goChallenges[0];

const audience = [
  ["Начинающим", "Получите понятную основу Go и рабочие инструменты без лишней теории."],
  ["Разработчикам", "Добавите Go, PostgreSQL, Docker и практики поставки в свой стек."],
  ["Тем, кто собирает портфолио", "Сделаете три самостоятельных проекта с GitHub-артефактами."],
];

export function PublicGoLanding({ navigate }) {
  const tracks = [
    { title: "Go Backend", status: "Доступен сейчас", description: "Создайте три backend-проекта и пройдите путь от первой строки до релиза.", icon: <Code size={52}/>, action: () => navigate("/academy"), visual: <TerminalWindow size={72}/> },
    { title: "SQL", status: "Скоро", description: "Научитесь получать данные, строить отчёты и принимать решения на их основе.", icon: <Stack size={52}/>, visual: <BracketsCurly size={72}/> },
    { title: "Docker", status: "Скоро", description: "Упакуйте приложение в контейнер и разверните его в любой среде.", icon: <RocketLaunch size={52}/>, visual: <Stack size={72}/> },
  ];
  return <main className="universal-landing">
    <section className="universal-hero container">
      <div className="universal-hero-copy">
        <h1>Осваивайте IT через реальные задачи</h1>
        <p>Короткая теория, настоящая практика и сертификат за подтверждённый результат.</p>
        <div className="universal-hero-actions"><button onClick={() => navigate("/academy")}>Войти в команду <ArrowRight size={20}/></button><button onClick={() => navigate("/#courses")}>Выбрать направление</button></div>
        <div className="universal-subscription-note"><Stack size={20}/><span>Все курсы по одной подписке</span></div>
      </div>
      <div className="universal-hero-art"><img src="/characters/godemy-universal-team-hero.png" alt="Команда Godemy совместно решает учебную задачу"/></div>
    </section>

    <section className="universal-courses container" id="courses">
      <p className="academy-kicker">НАПРАВЛЕНИЯ</p><h2>Каждый курс —<br/>рабочая история</h2>
      <div className="universal-course-list">{tracks.map((track) => <button key={track.title} disabled={!track.action} onClick={track.action} className={track.action ? "available" : "coming"}>
        <div className="universal-track-icon">{track.icon}</div><div className="universal-track-copy"><small>{track.status}</small><h3>{track.title}</h3><p>{track.description}</p>{track.action && <span>Подробнее <ArrowRight size={15}/></span>}</div><div className="universal-track-visual">{track.visual}</div><div className="universal-track-result"><ShieldCheck size={28}/><span><b>Сертификат</b><small>Подтвердите навыки<br/>и добавьте в портфолио</small></span></div>
      </button>)}</div>
    </section>

    <section className="universal-practice" id="practice"><div className="container"><div><p className="academy-kicker">ТОЛЬКО ВАЖНОЕ</p><h2>Не смотрите, как работают другие. Делайте сами.</h2></div><ol><li><b>Короткая теория</b><p>Только знания, нужные для следующей задачи.</p></li><li><b>Практика с проверкой</b><p>Тренажёр сразу показывает, что получилось.</p></li><li><b>Проект и сертификат</b><p>Результат можно открыть и показать другим.</p></li></ol></div></section>

    <section className="universal-subscription container" id="subscription"><div><p className="academy-kicker">ОДНА ПОДПИСКА</p><h2>Учитесь в своём темпе, а не по расписанию потока</h2><p>Подписка открывает курсы, тренажёр, проекты и сертификаты Godemy. Можно начать с Go и позже добавить новые навыки.</p></div><div className="universal-subscription-card"><CheckCircle size={31}/><h3>Всё обучение в одном доступе</h3><ul><li>Практические IT-курсы</li><li>Интерактивный тренажёр</li><li>Проекты для портфолио</li><li>Проверяемые сертификаты</li></ul><button onClick={() => navigate("/academy")}>Попробовать Godemy <ArrowRight size={18}/></button><small>Условия подписки появятся перед оплатой</small></div></section>

    <section className="universal-certificate container"><ShieldCheck size={54}/><div><p className="academy-kicker">СЕРТИФИКАТЫ</p><h2>Не за просмотр. За подтверждённый результат.</h2><p>Сертификат появляется в профиле после обязательных задач и проектов. Его можно открыть по ссылке и добавить в портфолио.</p></div><button onClick={() => navigate("/certificates")}>Посмотреть сертификаты <ArrowRight size={18}/></button></section>
  </main>;
}

export function AcademyHub({ navigate }) {
  return <main className="academy-hub">
    <section className="academy-hub-hero container"><button className="academy-hub-back" onClick={() => navigate("/")}>← О Godemy</button><p className="academy-kicker">УЧЕБНЫЙ ХАБ</p><h1>Что будем делать сегодня?</h1><p>Продолжи стажировку или разомнись на короткой Go-задаче.</p></section>
    <section className="academy-hub-paths container"><button className="hub-course" onClick={() => navigate("/go")}><BookOpen size={30}/><small>ОСНОВНОЙ МАРШРУТ</small><h2>Курс Go Backend Internship</h2><p>6 модулей · 30 тем · 150 уроков · 3 проекта</p><footer><span>Начать онбординг</span><ArrowRight size={20}/></footer></button><button className="hub-trainer" onClick={() => navigate("/trainer")}><Code size={30}/><small>КОРОТКАЯ ПРАКТИКА</small><h2>Тренажёр Go-задач</h2><p>Слайсы, map, структуры, JSON, HTTP и конкурентность</p><footer><span>Выбрать задачу</span><ArrowRight size={20}/></footer></button></section>
    <section className="academy-hub-status container"><div><p className="academy-kicker">ТВОЙ СТАРТ</p><h2>Онбординг в Bit Tech</h2><p>Настрой Go, Git и рабочий репозиторий. После первого push откроется Task Tracker.</p><button onClick={() => navigate("/go/lesson/internship-start/bit-tech/internship-start-bit-tech-1")}>Открыть первый урок <ArrowRight size={17}/></button></div><div className="hub-task-list"><small>ПОПРОБУЙ ПЕРЕД КУРСОМ</small>{goChallenges.slice(0,3).map((item) => <button onClick={() => navigate(`/task/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{item.title}</b><em>{item.minutes} мин</em><ArrowRight size={16}/></button>)}</div></section>
  </main>;
}

export function AcademyLanding({ navigate }) {
  return <main className="academy-landing">
    <section className="academy-hero container">
      <p className="academy-kicker">GODEMY · BIT TECH INTERNSHIP</p>
      <h1>Интерактивный курс<br />по <em>Go-разработке</em></h1>
      <p className="academy-lead">Освой Go через задания, приближенные к работе в команде: от первого commit до API в Docker.</p>
      <div className="academy-social-proof"><div className="proof-stack"><i>GO</i><i>SQL</i><i>CI</i></div><div><b>3 проекта</b><span>в портфолио с GitHub-артефактами</span></div></div>
      <div className="academy-paths">
        <button className="academy-path academy-course" onClick={() => navigate("/go")}><BookOpen size={26}/><h2>Курс по Go</h2><p>Шесть модулей и 150 коротких уроков, связанных с задачами Bit Tech.</p><ArrowRight size={22}/></button>
        <button className="academy-path academy-trainer" onClick={() => navigate("/trainer")}><Code size={26}/><h2>Тренажёр Go-задач</h2><p>Задачи по слайсам, map, ошибкам, JSON, HTTP и конкурентности.</p><ArrowRight size={22}/></button>
        <button className="academy-path academy-projects" onClick={() => navigate("/go")}><RocketLaunch size={26}/><h2>Рабочая стажировка</h2><p>Бриф → декомпозиция → код → проверка → GitHub.</p><ArrowRight size={22}/></button>
      </div>
    </section>

    <section className="academy-audience container"><div><p className="academy-kicker">КОМУ ПОДОЙДЁТ</p><h2>Не просто изучить синтаксис. Научиться работать с кодом.</h2></div><div>{audience.map(([title, copy], index) => <article key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{copy}</p></article>)}</div></section>

    <section className="academy-program container"><div className="academy-section-heading"><div><p className="academy-kicker">ПРОГРАММА</p><h2>Путь от инструментов до релиза</h2></div><button onClick={() => navigate("/go")}>Вся программа <ArrowRight size={17}/></button></div><div className="academy-module-list">{courseCurriculum.map((module, index) => <button onClick={() => navigate("/go")} key={module.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{module.phase}</small><h3>{module.title}</h3><p>{module.summary}</p></div><b>{module.topics.length} тем · {module.topics.reduce((sum, topic) => sum + topic.lessons.length, 0)} уроков</b><ArrowRight size={18}/></button>)}</div></section>

    <section className="academy-practice container"><div className="academy-practice-copy"><p className="academy-kicker">GO-ТРЕНАЖЁР</p><h2>Решайте задачи до того, как они встретятся в проекте.</h2><p>Фильтруйте упражнения по теме и сложности. Откройте задачу, напишите решение и получите спокойную подсказку, если застряли.</p><button className="academy-dark-button" onClick={() => navigate("/trainer")}>Открыть тренажёр <ArrowRight size={17}/></button></div><div className="academy-task-preview">{goChallenges.slice(0, 4).map((item, index) => <button onClick={() => navigate(`/task/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><small>{item.category} · {item.minutes} мин</small><ArrowRight size={16}/></button>)}</div></section>

    <section className="academy-outcome container"><GitBranch size={31}/><div><p className="academy-kicker">РЕЗУЛЬТАТ</p><h2>Понятный след в GitHub, а не сертификат за просмотр.</h2><p>Каждый проект заканчивается README, тестами, понятной историей commit и релизом. Сертификат Godemy появляется после финальной проверки трёх проектов.</p></div><button onClick={() => navigate("/profile")}>Открыть кабинет <ArrowRight size={17}/></button></section>
  </main>;
}

export function GoTrainer({ navigate }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Все");
  const [category, setCategory] = useState("Все");
  const categories = ["Все", ...new Set(goChallenges.map((item) => item.category))];
  const filtered = useMemo(() => goChallenges.filter((item) => (level === "Все" || item.level === level) && (category === "Все" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())), [query, level, category]);
  return <main className="go-trainer container">
    <header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · BIT TECH</p><h1>Тренажёр Go-задач</h1><p>Короткие упражнения, которые подготавливают к трём проектам стажировки.</p></div><div className="trainer-progress-note"><CheckCircle size={20}/><span><b>Начните с малого</b><small>Прогресс будет сохраняться в вашем кабинете после подключения БД.</small></span></div></header>
    <section className="go-trainer-filters" aria-label="Фильтры задач"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}><i className={`level-${item}`}/>{item}{item !== "Все" && <small>{goChallenges.filter((challenge) => challenge.level === item).length}</small>}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск задачи" aria-label="Поиск задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section>
    <section className="go-task-list" aria-live="polite">{filtered.length ? filtered.map((item, index) => <button onClick={() => navigate(`/task/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>) : <div className="trainer-empty"><BracketsCurly size={26}/><b>Подходящих задач пока нет</b><p>Снимите один из фильтров или измените запрос.</p></div>}</section>
    <section className="trainer-project-callout"><Stack size={25}/><div><b>Не знаете, с чего начать?</b><p>Пройдите модуль «Старт стажировки», а затем решите первые три лёгкие задачи.</p></div><button onClick={() => navigate("/go")}>К программе <ArrowRight size={17}/></button></section>
  </main>;
}
