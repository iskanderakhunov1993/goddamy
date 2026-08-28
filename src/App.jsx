import { useEffect, useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, Circle,
  List, UserCircle, X
} from "@phosphor-icons/react";
import {
  CertificatesPage, CoursePage, ProfilePage, ProjectPage, RetrospectivePage, SetupPage, SprintPage, StoryLesson, SubscriptionPage
} from "./components/LearningPages.jsx";
import { CourseEditor } from "./components/CourseEditor.jsx";
import { EditorAuthGate } from "./components/EditorAuthGate.jsx";
import { AcademyHub, PublicGoLanding, GoTrainer } from "./components/AcademyExperience.jsx";
import { GoTask } from "./components/GoTask.jsx";
import { SqlCoursePage, SqlTask, SqlTrainer } from "./components/SqlExperience.jsx";
import { PythonCoursePage, PythonTask, PythonTrainer } from "./components/PythonExperience.jsx";
import { BusinessPracticeComing, ProductCoursePage, QaCoursePage } from "./components/BusinessCourses.jsx";
import { QaTask, QaTrainer } from "./components/QaExperience.jsx";

const modules = [
  { n: "00", title: "Старт", text: "Как устроен курс, среда разработки и первая программа.", lessons: ["Добро пожаловать в Go", "Установка Go и редактора", "Первая программа"] },
  { n: "01", title: "Основы языка", text: "Синтаксис, типы, функции и управление потоком программы.", lessons: ["Пакеты и импорт", "Переменные и константы", "Базовые типы", "Условия", "Циклы", "Функции"] },
  { n: "02", title: "Составные типы", text: "Массивы, слайсы, map и структуры на практических задачах.", lessons: ["Массивы и слайсы", "Map", "Структуры", "Методы", "Указатели"] },
  { n: "03", title: "Интерфейсы и ошибки", text: "Идиоматичный Go: композиция, контракты и обработка ошибок.", lessons: ["Интерфейсы", "Композиция", "Ошибки", "Panic и recover", "Generics"] },
  { n: "04", title: "Конкурентность", text: "Горутины, каналы и безопасная параллельная работа.", lessons: ["Горутины", "Каналы", "Select", "Mutex", "Context", "Паттерны конкурентности"] },
  { n: "05", title: "Backend на Go", text: "HTTP API, JSON, базы данных, тесты и production-практики.", lessons: ["HTTP-сервер", "REST API", "JSON", "Работа с PostgreSQL", "Тестирование", "Логирование", "Профилирование"] },
];

function Logo({ onHome }) {
  return <button className="logo" onClick={onHome}><span>GO</span>DEMY</button>;
}

function Header({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (page) => setPage(page);
  return (
    <header className="site-header">
      <Logo onHome={() => nav("home")} />
      <nav>
        <button onClick={() => nav("/#courses")}>Курсы</button>
        <button className="hide-mobile" onClick={() => nav("/#certificate")}>Сертификаты</button>
        <button className="hide-mobile" onClick={() => nav("/#subscription")}>Подписка</button>
      </nav>
      <div className="header-actions">
        <button className="hide-mobile" aria-label="Профиль" onClick={() => nav("/profile")}><UserCircle size={20}/></button>
        <button className="login hide-mobile" onClick={() => nav("/go")}>Начать</button>
        <button className="mobile-menu" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={21}/> : <List size={21}/>}</button>
      </div>
      {menuOpen && <nav className="mobile-nav-panel" aria-label="Мобильная навигация">
        <button onClick={() => { nav("/#courses"); setMenuOpen(false); }}>Курсы</button>
        <button onClick={() => { nav("/#certificate"); setMenuOpen(false); }}>Сертификаты</button>
        <button onClick={() => { nav("/#subscription"); setMenuOpen(false); }}>Подписка</button>
        <button onClick={() => { nav("/go"); setMenuOpen(false); }}>Начать</button>
      </nav>}
    </header>
  );
}

function Home({ setPage }) {
  return <PublicGoLanding navigate={setPage}/>;
  /* Legacy landing retained below while the academy layout is being evaluated.
  return (
    <>
      <section className="hero">
        <div className="eyebrow">BIT TECH · GO BACKEND INTERNSHIP</div>
        <h1>Стажировка по Go<br /><em>через реальные проекты</em></h1>
        <p>Пройди путь от первого commit до трёх GitHub-проектов: CLI, backend-сервис с PostgreSQL и API в Docker.</p>
        <div className="hero-actions">
          <button className="primary" onClick={() => setPage("course")}>Начать учиться <ArrowRight size={17}/></button>
          <button className="secondary" onClick={() => setPage("trainer")}>Открыть тренажёр</button>
        </div>
        <div className="proof"><b>3 проекта</b><span>с проверяемыми артефактами в GitHub</span><div className="avatars"><i>BT</i><i>GO</i><i>CI</i></div></div>
      </section>

      <section className="path-grid container">
        <button className="path-card blue" onClick={() => setPage("course")}><small>01 · ТЕОРИЯ + ПРАКТИКА</small><h2>Курс по Go</h2><p>Шесть модулей, 30 тем и маленькие шаги, связанные с задачами команды</p><b>150 уроков <ArrowUpRight size={22}/></b></button>
        <button className="path-card mint" onClick={() => setPage("trainer")}><small>02 · УЧИМСЯ КОДОМ</small><h2>Go-тренажёр</h2><p>Задачи из реальной backend-разработки и собеседований</p><b>120 задач <ArrowUpRight size={22}/></b></button>
        <div className="path-card dark"><small>03 · В ПОРТФОЛИО</small><h2>3 проекта</h2><p>Task Tracker, Expense Tracker и URL Shortener API</p><b>GitHub + CI <ArrowUpRight size={22}/></b></div>
      </section>

      <section className="audience container">
        <div><small>КОМУ ПОДОЙДЁТ</small><h2>Путь в backend,<br />который не бросают</h2></div>
        <div className="audience-list">
          <article><b>01</b><h3>Новичкам</h3><p>Понятно разберётесь в программировании и соберёте первые проекты.</p></article>
          <article><b>02</b><h3>Frontend-разработчикам</h3><p>Добавите backend и начнёте создавать продукты целиком.</p></article>
          <article><b>03</b><h3>Опытным инженерам</h3><p>Освоите идиомы Go, конкурентность и инструменты production.</p></article>
        </div>
      </section>

      <section className="code-demo container">
        <div className="demo-copy"><small>ИНТЕРАКТИВНЫЙ ПОДХОД</small><h2>Читайте меньше.<br />Пишите больше.</h2><p>Код запускается прямо в браузере. Получайте понятную обратную связь и переходите дальше в своём темпе.</p><button className="primary" onClick={() => setPage("task")}>Попробовать задачу <ArrowRight size={17}/></button></div>
        <div className="editor-card">
          <div className="editor-top"><b>main.go</b><button><Play size={14} weight="fill"/> Запустить</button></div>
          <pre><span>1</span> <code>package</code> main{"\n\n"}<span>3</span> <code>import</code> "fmt"{"\n\n"}<span>5</span> <code>func</code> main() {"{"}{"\n"}<span>6</span>   skills := []string{"{"}"Go", "HTTP", "SQL"{"}"}{"\n"}<span>7</span>   fmt.Println(<strong>skills</strong>){"\n"}<span>8</span> {"}"}</pre>
          <div className="console"><small>КОНСОЛЬ</small><p>[Go HTTP SQL]</p><b>Выполнено за 0.14 сек.</b></div>
        </div>
      </section>

      <section className="curriculum-preview container">
        <small>ПРОГРАММА</small><h2>От нуля до production</h2>
        <div>{modules.slice(0, 4).map(m => <article key={m.n}><b>{m.n}</b><h3>{m.title}</h3><p>{m.text}</p><span>{m.lessons.length} уроков</span></article>)}</div>
        <button className="secondary" onClick={() => setPage("course")}>Посмотреть всю программу <ArrowRight size={17}/></button>
      </section>
    </>
  );
  */
}

export function LegacyLesson({ setPage }) {
  return (
    <main className="inner container">
      <div className="page-intro"><small>ИНТЕРАКТИВНЫЙ КУРС</small><h1>Go с нуля до backend-разработчика</h1><p>Осмысленный маршрут через язык, стандартную библиотеку и практики создания надёжных сервисов.</p><div className="stats"><span><b>42</b> урока</span><span><b>67</b> упражнений</span><span><b>≈ 8</b> недель</span></div></div>
      <div className="modules">
        {modules.map((m, idx) => <section className="module" key={m.n}>
          <div className="module-copy"><small>МОДУЛЬ {m.n}</small><h2>{m.title}</h2><p>{m.text}</p></div>
          <div className="lesson-list">{m.lessons.map((l, i) => <button key={l} onClick={() => setPage("lesson")}><span className={idx === 0 && i === 0 ? "done" : ""}>{idx === 0 && i === 0 ? <Check size={14}/> : String(i + 1).padStart(2, "0")}</span><b>{l}</b><em>{i % 2 ? "8 мин" : "12 мин"}</em><ArrowRight size={16}/></button>)}</div>
        </section>)}
      </div>
    </main>
  );
}

function Course({ setPage }) {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  return (
    <main className="lesson-shell">
      <aside className="lesson-nav"><small>Модуль 1</small><h3>Основы языка</h3><p>Урок 1 из 6</p>{modules[1].lessons.map((l,i)=><button key={l} className={i===0?"active":""}><span>{i===0?<Circle size={18} weight="bold"/>:<Circle size={18}/>}</span>{l}</button>)}<button className="collapse"><ArrowLeft size={16}/> Свернуть</button></aside>
      <article className="lesson-content">
        <div className="lesson-meta"><span>Модуль 1</span><b>·</b><span>Урок 1 из 6</span><em>12 минут</em></div>
        <div className="lesson-progress"><i></i></div>
        <small>ОСНОВЫ ЯЗЫКА</small><h1>Пакеты и импорт</h1>
        <p className="lead">Любая программа на Go состоит из пакетов. Разберёмся, как они объединяют код и почему выполнение начинается с <code>package main</code>.</p>
        <div className="callout"><b>Запомните</b><p>Пакет — это директория с исходными файлами Go, которые разделяют общее имя и работают как единое целое.</p></div>
        <h2>Пакет main</h2><p>Исполняемая программа должна содержать пакет <code>main</code> и функцию <code>main()</code>. Она служит точкой входа — с неё начинается выполнение.</p>
        <pre className="lesson-code"><small>main.go</small><code><i>package</i> main{"\n\n"}<i>import</i> "fmt"{"\n\n"}<i>func</i> main() {"{"}{"\n"}  fmt.Println("Hello, Go!"){"\n"}{"}"}</code></pre>
        <h2>Импорт зависимостей</h2><p>Ключевое слово <code>import</code> подключает другие пакеты. Компилятор Go не разрешает неиспользуемые импорты — это сохраняет код чистым.</p>
        <div className="quiz">
          <small>ПРОВЕРЬТЕ СЕБЯ</small><h3>Какой пакет превращает код Go в исполняемую программу?</h3>
          {["package fmt", "package main", "package app"].map(a => <label key={a} className={checked && a==="package main"?"correct":""}><input type="radio" name="q" checked={answer===a} onChange={()=>{setAnswer(a);setChecked(false)}}/><span></span>{a}</label>)}
          <button className="primary" disabled={!answer} onClick={()=>setChecked(true)}>{checked ? answer==="package main" ? <>Верно! Продолжить <ArrowRight size={17}/></> : "Попробовать ещё" : "Проверить ответ"}</button>
        </div>
        <div className="lesson-next"><button className="back" onClick={() => setPage("course")}><ArrowLeft size={17}/> Назад</button><button className="primary">Далее <ArrowRight size={17}/></button></div>
      </article>
      <aside className="toc"><button><List size={18}/><b>В этом уроке</b><ArrowRight size={16}/></button></aside>
    </main>
  );
}

function Trainer({ setPage }) {
  return <GoTrainer navigate={setPage}/>;
  /* Legacy trainer retained below while the academy layout is being evaluated.
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Все");
  const shown = useMemo(() => tasks.filter(t => (level==="Все" || t.level===level) && t.title.toLowerCase().includes(query.toLowerCase())), [query,level]);
  return (
    <main className="inner container">
      <div className="page-intro trainer-intro"><small>GO-ТРЕНАЖЁР</small><h1>Практика, похожая<br />на настоящую работу</h1><p>Решайте задачи, запускайте тесты и учитесь читать обратную связь компилятора.</p></div>
      <div className="trainer-stats"><button onClick={()=>setLevel("Лёгкая")}><Circle size={12} weight="fill"/><b>38</b><small>Лёгких</small></button><button onClick={()=>setLevel("Средняя")}><Circle size={12} weight="fill"/><b>54</b><small>Средних</small></button><button onClick={()=>setLevel("Сложная")}><Circle size={12} weight="fill"/><b>28</b><small>Сложных</small></button></div>
      <section className="task-browser">
        <div className="filters"><label className="filter-search"><MagnifyingGlass size={16}/><input aria-label="Поиск задач" placeholder="Поиск по заданиям" value={query} onChange={e=>setQuery(e.target.value)}/></label><div>{["Все","Лёгкая","Средняя","Сложная"].map(x=><button className={level===x?"active":""} onClick={()=>setLevel(x)} key={x}>{x}</button>)}</div></div>
        <div className="task-table"><div className="task-head"><span>ЗАДАНИЕ</span><span>ТЕМЫ</span><span>СЛОЖНОСТЬ</span><span></span></div>{shown.map(t=><button className="task-row" onClick={()=>setPage("task")} key={t.id}><span><i>{String(t.id).padStart(2,"0")}</i><b>{t.title}</b></span><span>{t.tags.map(x=><em key={x}>{x}</em>)}</span><span className={"level "+t.level}>{t.level}</span><ArrowRight size={17}/></button>)}</div>
      </section>
    </main>
  );
  */
}

export function App() {
  const legacyRoute = () => {
    const hash = location.hash.replace("#", "");
    if (location.pathname !== "/") return location.pathname;
    return ({ course: "/go", trainer: "/go/practice", lesson: "/lesson", task: "/go/practice" })[hash] || "/";
  };
  const [route, setRoute] = useState(legacyRoute);
  useEffect(() => {
    const update = () => setRoute(legacyRoute());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    const titleByRoute = {
      "/": "Godemy — практические IT-курсы по подписке",
      "/academy": "Godemy — курс и тренажёр Go",
      "/go": "Курс Go с нуля до Junior — Godemy",
      "/go/practice": "Практика курса Go — Godemy",
      "/sql": "Интерактивный курс SQL — Godemy",
      "/sql/practice": "Практика курса SQL — Godemy",
      "/python": "Интерактивный курс Python — Godemy",
      "/python/practice": "Практика курса Python — Godemy",
      "/product": "Курс Product Management — Godemy",
      "/product/practice": "Практика Product Management — Godemy",
      "/qa": "Курс QA — Godemy",
      "/qa/practice": "Практика QA — Godemy",
      "/go/task-tracker": "Проект Task Tracker — Godemy",
      "/go/task-tracker/setup": "Подготовка к проекту — Godemy",
      "/go/task-tracker/retrospective": "Ретроспектива проекта — Godemy",
      "/profile": "Прогресс обучения — Godemy",
      "/certificates": "Сертификаты Godemy",
      "/subscription": "Подписка Godemy",
      "/course-editor": "Редактор курса — Godemy",
    };
    const sprint = route.match(/^\/go\/task-tracker\/sprint\/([1-4])$/);
    const courseLesson = route.match(/^\/go\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
    document.title = courseLesson ? "Урок курса Основы Go — Godemy" : sprint ? `Спринт ${sprint[1]} · Task Tracker — Godemy` : titleByRoute[route] || "Godemy — обучение Go";
  }, [route]);
  const navigate = (target) => {
    const routes = { home: "/", course: "/go", trainer: "/go/practice", lesson: "/lesson", task: "/go/practice" };
    const next = routes[target] || target;
    if (next.startsWith("/#")) {
      const anchor = next.split("#")[1];
      history.pushState({}, "", next);
      setRoute("/");
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }));
    } else {
      history.pushState({}, "", next);
      setRoute(next);
      window.scrollTo(0, 0);
    }
  };
  const sprintMatch = route.match(/^\/go\/task-tracker\/sprint\/([1-4])$/);
  const lessonMatch = route.match(/^\/go\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const taskMatch = route.match(/^\/(?:task|go\/practice)(?:\/([^/]+))?$/);
  const sqlTaskMatch = route.match(/^\/sql\/practice\/([^/]+)$/);
  const pythonTaskMatch = route.match(/^\/python\/practice\/([^/]+)$/);
  const qaTaskMatch = route.match(/^\/qa\/practice\/([^/]+)$/);
  let content;
  if (route === "/") content = <Home setPage={navigate}/>;
  else if (route === "/academy") content = <AcademyHub navigate={navigate}/>;
  else if (route === "/go") content = <CoursePage navigate={navigate}/>;
  else if (route === "/sql") content = <SqlCoursePage navigate={navigate}/>;
  else if (route === "/sql/practice") content = <SqlTrainer navigate={navigate}/>;
  else if (sqlTaskMatch) content = <SqlTask challengeId={sqlTaskMatch[1]} navigate={navigate} key={sqlTaskMatch[1]}/>;
  else if (route === "/python") content = <PythonCoursePage navigate={navigate}/>;
  else if (route === "/python/practice") content = <PythonTrainer navigate={navigate}/>;
  else if (pythonTaskMatch) content = <PythonTask challengeId={pythonTaskMatch[1]} navigate={navigate}/>;
  else if (route === "/product") content = <ProductCoursePage navigate={navigate}/>;
  else if (route === "/product/practice") content = <BusinessPracticeComing navigate={navigate} course="product"/>;
  else if (route === "/qa") content = <QaCoursePage navigate={navigate}/>;
  else if (route === "/qa/practice") content = <QaTrainer navigate={navigate}/>;
  else if (qaTaskMatch) content = <QaTask challengeId={qaTaskMatch[1]} navigate={navigate}/>;
  else if (route === "/go/task-tracker") content = <ProjectPage navigate={navigate}/>;
  else if (route === "/go/task-tracker/setup") content = <SetupPage navigate={navigate}/>;
  else if (sprintMatch) content = <SprintPage number={Number(sprintMatch[1])} navigate={navigate}/>;
  else if (route === "/go/task-tracker/retrospective") content = <RetrospectivePage navigate={navigate}/>;
  else if (route === "/profile") content = <ProfilePage navigate={navigate}/>;
  else if (route === "/certificates") content = <CertificatesPage navigate={navigate}/>;
  else if (route === "/subscription") content = <SubscriptionPage navigate={navigate}/>;
  else if (route === "/course-editor") content = <EditorAuthGate><CourseEditor navigate={navigate}/></EditorAuthGate>;
  else if (lessonMatch) content = <StoryLesson sectionId={lessonMatch[1]} topicId={lessonMatch[2]} lessonId={lessonMatch[3]} navigate={navigate}/>;
  else if (route === "/lesson") content = <StoryLesson navigate={navigate}/>;
  else if (route === "/trainer" || route === "/go/practice") content = <Trainer setPage={navigate}/>;
  else if (taskMatch) content = <GoTask challengeId={taskMatch[1]} navigate={navigate} key={taskMatch[1]}/>;
  else content = <CoursePage navigate={navigate}/>;
  const immersive = Boolean(taskMatch) || Boolean(sqlTaskMatch) || Boolean(pythonTaskMatch) || Boolean(qaTaskMatch) || route === "/trainer" || route === "/go/practice" || route === "/sql" || route === "/sql/practice" || route === "/python" || route === "/python/practice" || route === "/product" || route === "/product/practice" || route === "/qa" || route === "/qa/practice" || route === "/go" || route === "/lesson" || route === "/course-editor" || Boolean(lessonMatch);
  return <>{!immersive && <Header setPage={navigate}/>} {content}{!immersive && <Footer setPage={navigate}/>}</>;
}

function Footer({setPage}) {
  return <footer><Logo onHome={()=>setPage("/")}/><p>Практическое IT-обучение через курсы, проекты и проверяемые результаты.</p><div><button onClick={()=>setPage("/academy")}>Курс Go</button><button onClick={()=>setPage("/sql")}>Курс SQL</button><button onClick={()=>setPage("/python")}>Курс Python</button><button onClick={()=>setPage("/product")}>Product</button><button onClick={()=>setPage("/qa")}>QA</button><button onClick={()=>setPage("/certificates")}>Сертификаты</button></div><small>© 2026 Godemy · Практический учебный проект</small></footer>;
}
