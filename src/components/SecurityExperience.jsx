import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle, Code, House, MagnifyingGlass, Play, ShieldCheck,
  SlidersHorizontal, UserCircle, XCircle,
} from "@phosphor-icons/react";
import "../styles-sql.css";
import "../styles-security.css";
import { LessonBlocks } from "./LessonBlocks.jsx";
import {
  SECURITY_PRACTICE_SLUG, SECURITY_SLUG, getSecurityLesson, securityCurriculum, securityFlatLessons,
  securityLessonPath, securityPlannedModules,
} from "../content/security/curriculum.js";
import { getSecurityChallenge, securityChallenges } from "../content/security/challenges.js";
import { PROJECT_SLUG, securityProject, securityProjectStages } from "../content/security/project.js";
import { checkSolution, runPythonProgram, assembleSource } from "../lib/pyodidePlayground.js";
import { getCompletedCount, getCompletedLessonIds, markLessonComplete } from "../lib/progress.js";
import { getLessonFeedback, setLessonFeedback } from "../lib/lessonFeedback.js";
import { recordPractice } from "../lib/activity.js";
import { lessonsLabel } from "../lib/plural.js";

function withInlineCode(text) {
  return text.split(/(`[^`]+`)/g).filter(Boolean).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? <code className="inline-code" key={index}>{part.slice(1, -1)}</code> : part);
}

export function SecurityCoursePage({ navigate }) {
  const [openModule, setOpenModule] = useState(securityCurriculum[0].id);
  const completed = new Set(getCompletedLessonIds(SECURITY_SLUG));
  const total = securityFlatLessons.length;
  const done = securityFlatLessons.filter((lesson) => completed.has(lesson.id)).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const nextLesson = securityFlatLessons.find((lesson) => !completed.has(lesson.id));
  const solved = getCompletedCount(SECURITY_PRACTICE_SLUG);
  const doneSprints = new Set(getCompletedLessonIds(PROJECT_SLUG));
  const start = () => navigate(securityLessonPath(nextLesson || securityFlatLessons[0]));

  return <main className="course-dashboard course-dashboard-security">
    <aside className="dashboard-rail" aria-label="Навигация курса">
      <button className="dashboard-logo" onClick={() => navigate("/")}><span>GO</span>DEMY</button>
      <nav>
        <button aria-label="Главная" onClick={() => navigate("/")}><House size={20}/></button>
        <button className="active" aria-label="Курс"><BookOpen size={20}/></button>
        <button aria-label="Практика" onClick={() => navigate("/security/practice")}><Code size={20}/></button>
      </nav>
      <button aria-label="Профиль" onClick={() => navigate("/profile")}><UserCircle size={21}/></button>
    </aside>
    <div className="dashboard-content">
      <section className="course-hero">
        <div className="course-hero-copy">
          <small>БЕЗОПАСНОСТЬ ДЛЯ НОВИЧКОВ</small>
          <h1>Основы кибербезопасности</h1>
          <p>Короткая теория с задачами, затем практика: находишь уязвимости в учебном коде и исправляешь их. Всё выполняется в браузере, атаки идут только на учебные примеры.</p>
          <div className="course-hero-actions">
            <button className="btn-primary" onClick={start}>{done ? "Продолжить" : "Начать курс"} <ArrowRight size={18}/></button>
            <button className="btn-ghost" onClick={() => navigate("/security/practice")}><Code size={17}/> Тренажёр</button>
          </div>
        </div>
        <div className="course-includes">
          <b>В курсе сейчас</b>
          <ul>
            <li><BookOpen size={16}/> {lessonsLabel(total)} в 2 теоретических модулях</li>
            <li><Code size={16}/> {securityChallenges.length} задач «исправь уязвимость»</li>
            <li><ShieldCheck size={16}/> Проект «Заметки»: {securityProject.sprints.length} спринта, проверка скриптом</li>
          </ul>
        </div>
      </section>

      <div className="course-prog"><span className="course-prog-pill">{percent}%</span><div className="course-prog-track"><span style={{ width: `${percent}%` }}/></div><span className="course-prog-label">{done} / {total} уроков · {solved} / {securityChallenges.length} задач · {[...doneSprints].filter((id) => id.startsWith("sprint-")).length} / {securityProject.sprints.length} спринтов</span></div>

      <section className="dashboard-program">
        <h2 className="course-syllabus-heading">Программа курса</h2>
        <div className="sec-modules">
          {securityCurriculum.map((module, index) => {
            const open = openModule === module.id;
            const lessons = module.topics.flatMap((topic) => topic.lessons);
            const moduleDone = lessons.filter((lesson) => completed.has(lesson.id)).length;
            return <article className={`sec-module ${open ? "open" : ""}`} key={module.id}>
              <button className="sec-module-head" onClick={() => setOpenModule(open ? null : module.id)} aria-expanded={open}>
                <span className="sec-module-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="sec-module-title"><b>{module.title}</b><small>{module.summary}</small></span>
                <span className="sec-module-meta">{module.phase} · {moduleDone}/{lessons.length}</span>
              </button>
              {open && <div className="sec-topics">{module.topics.map((topic) => <div className="sec-topic" key={topic.id}>
                <h3>{topic.title}</h3>
                <ul>{topic.lessons.map((lesson) => <li key={lesson.id}><button onClick={() => navigate(securityLessonPath({ ...lesson, topic, section: module }))}>
                  <span className={`sec-check ${completed.has(lesson.id) ? "done" : ""}`}>{completed.has(lesson.id) && <Check size={12} weight="bold"/>}</span>{lesson.title}</button></li>)}</ul>
              </div>)}</div>}
            </article>;
          })}
          {securityPlannedModules.map((module, index) => <article className="sec-module planned" key={module.id}>
            <button className="sec-module-head" onClick={() => navigate(module.path)}>
              <span className="sec-module-num">{String(securityCurriculum.length + index + 1).padStart(2, "0")}</span>
              <span className="sec-module-title"><b>{module.title}</b><small>{module.summary}</small></span>
              <span className="sec-module-meta">Открыть <ArrowRight size={13}/></span>
            </button>
          </article>)}
          <article className={`sec-module ${openModule === "project" ? "open" : ""}`}>
            <button className="sec-module-head" onClick={() => setOpenModule(openModule === "project" ? null : "project")} aria-expanded={openModule === "project"}>
              <span className="sec-module-num">{String(securityCurriculum.length + securityPlannedModules.length + 1).padStart(2, "0")}</span>
              <span className="sec-module-title"><b>{securityProject.title}</b><small>Запускаешь уязвимое приложение у себя и закрываешь девять уязвимостей. Проверка: скрипт check.py.</small></span>
              <span className="sec-module-meta">ПРОЕКТ · {[...doneSprints].filter((id) => id.startsWith("sprint-")).length}/{securityProject.sprints.length}</span>
            </button>
            {openModule === "project" && <div className="sec-topics"><div className="sec-topic"><h3>Этапы</h3><ul>
              {securityProjectStages.map((stage) => <li key={stage.id}><button onClick={() => navigate(stage.path)}><span className={`sec-check ${doneSprints.has(stage.id) ? "done" : ""}`}>{doneSprints.has(stage.id) && <Check size={12} weight="bold"/>}</span>{stage.title}</button></li>)}
            </ul></div></div>}
          </article>
        </div>
      </section>
    </div>
  </main>;
}

export function SecurityLesson({ sectionId, topicId, lessonId, navigate }) {
  const current = getSecurityLesson(sectionId, topicId, lessonId);
  const index = securityFlatLessons.findIndex((item) => item.id === current.id);
  const previous = securityFlatLessons[index - 1];
  const next = securityFlatLessons[index + 1];
  const lessonIndex = current.topic.lessons.findIndex((item) => item.id === current.id);
  const [completedIds, setCompletedIds] = useState(() => new Set(getCompletedLessonIds(SECURITY_SLUG)));
  const [feedbackState, setFeedbackState] = useState(() => ({ id: current.id, value: getLessonFeedback(current.id) }));
  if (feedbackState.id !== current.id) setFeedbackState({ id: current.id, value: getLessonFeedback(current.id) });
  const feedback = feedbackState.value;
  const sendFeedback = (value) => {
    const nextValue = feedback === value ? null : value;
    setFeedbackState({ id: current.id, value: nextValue });
    setLessonFeedback(current.id, nextValue);
  };
  const go = (target) => {
    markLessonComplete(SECURITY_SLUG, current.id);
    setCompletedIds((ids) => new Set(ids).add(current.id));
    navigate(target ? securityLessonPath(target) : "/security/practice");
  };

  return <main className="story-lesson-shell">
    <aside className="story-side">
      <button onClick={() => navigate("/security")} aria-label="К программе"><ArrowLeft size={20}/></button>
      <button onClick={() => navigate("/")} aria-label="На главную"><House size={20}/></button>
      <button onClick={() => navigate("/security")} aria-label="Мой курс"><BookOpen size={20}/></button>
    </aside>
    <article className="story-lesson lesson-reader">
      <header>
        <div>{current.section.title} <span/> {current.topic.title} · Урок {lessonIndex + 1}/{current.topic.lessons.length}</div>
        <i>{current.topic.lessons.map((item) => <b className={completedIds.has(item.id) || item.id === current.id ? "complete" : ""} key={item.id}/>)}</i>
      </header>
      <h1>{current.title}</h1>
      <p className="story-lead">{current.summary}</p>
      <LessonBlocks blocks={current.blocks}/>
      <footer className="lesson-footer">
        <div className="lesson-feedback-group">
          <button className={`lesson-feedback ${feedback === "useful" ? "active" : ""}`} aria-pressed={feedback === "useful"} onClick={() => sendFeedback("useful")}>Полезно</button>
          <button className={`lesson-feedback ${feedback === "confusing" ? "active" : ""}`} aria-pressed={feedback === "confusing"} onClick={() => sendFeedback("confusing")}>Непонятно</button>
          {feedback && <span className="lesson-feedback-thanks">Спасибо, учли</span>}
        </div>
        <div className="lesson-pager">
          {previous && <button onClick={() => navigate(securityLessonPath(previous))}><ArrowLeft size={17}/> Назад</button>}
          <button className="story-next" onClick={() => go(next)}>{next ? "К следующему уроку" : "К тренажёру"} <ArrowRight size={17}/></button>
        </div>
      </footer>
    </article>
  </main>;
}

export function SecurityTrainer({ navigate }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Все");
  const [category, setCategory] = useState("Все");
  const solved = new Set(getCompletedLessonIds(SECURITY_PRACTICE_SLUG));
  const categories = ["Все", ...new Set(securityChallenges.map((item) => item.category))];
  const filtered = useMemo(() => securityChallenges.filter((item) => (level === "Все" || item.level === level) && (category === "Все" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())), [query, level, category]);
  return <main className="go-practice-shell security-practice-shell">
    <nav className="course-context-nav" aria-label="Разделы курса"><button onClick={() => navigate("/")}><ArrowLeft size={16}/> Все направления</button><div><button onClick={() => navigate("/security")}>Курс</button><button className="active">Практика</button></div></nav>
    <div className="go-trainer container">
      <header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · БЕЗОПАСНОСТЬ</p><h1>Исправь уязвимость</h1><p>В каждой задаче уязвимый код. Твоя цель: чтобы атака перестала работать, а обычный ввод остался рабочим. Код выполняется в браузере.</p></div><div className="trainer-progress-note"><ShieldCheck size={20}/><span><b>Решено {solved.size} из {securityChallenges.length}</b><small>Атаки идут только на учебный код задач.</small></span></div></header>
      <section className="go-trainer-filters"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section>
      <section className="go-task-list">{filtered.map((item, index) => <button onClick={() => navigate(`/security/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}{solved.has(item.id) && <i className="sec-solved"> · решено</i>}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>)}</section>
    </div>
  </main>;
}

export function SecurityTask({ challengeId, navigate }) {
  const challenge = getSecurityChallenge(challengeId);
  const [code, setCode] = useState(challenge.starter);
  const [tab, setTab] = useState("result");
  const [showHint, setShowHint] = useState(false);
  const [run, setRun] = useState({ status: "idle", stdout: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [loadMessage, setLoadMessage] = useState("");

  const withBusy = async (action) => {
    setBusy(true);
    setTab("result");
    recordPractice("security");
    setLoadMessage("Загружаем Python в браузер (только при первом запуске)…");
    const timer = setTimeout(() => setLoadMessage("Выполняем код…"), 1500);
    try { await action(); } finally { clearTimeout(timer); setBusy(false); setLoadMessage(""); }
  };

  const execute = () => withBusy(async () => {
    try {
      const result = await runPythonProgram(assembleSource(code, challenge.harness));
      setRun({ status: result.status === "ok" ? "ran" : result.status, stdout: result.stdout, message: result.message });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    }
  });

  const submit = () => withBusy(async () => {
    try {
      const result = await checkSolution(challenge, code);
      const status = result.status === "ok" ? (result.matched ? "success" : "mismatch") : result.status;
      if (status === "success") markLessonComplete(SECURITY_PRACTICE_SLUG, challenge.id);
      setRun({ status, stdout: result.stdout, message: result.message });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    }
  });

  const failed = ["mismatch", "compile-error", "runtime-error", "network-error"].includes(run.status);
  const tone = run.status === "success" ? "success" : failed ? "error" : "";
  const index = securityChallenges.findIndex((item) => item.id === challenge.id);
  const nextChallenge = securityChallenges[index + 1];

  return <main className="sql-task-shell python-task-shell">
    <header><button onClick={() => navigate("/security/practice")}><ArrowLeft size={17}/> Все задачи</button><span>Python · Pyodide</span><button onClick={() => navigate("/security")}>Программа курса</button></header>
    <div className="sql-task-grid">
      <section className="sql-task-brief">
        <p className="academy-kicker">{challenge.level.toUpperCase()} · {challenge.minutes} МИН · {challenge.category.toUpperCase()}</p>
        <h1>{challenge.title}</h1>
        <p>{challenge.description}</p>
        <button onClick={() => setShowHint((value) => !value)}>{showHint ? "Скрыть подсказку" : "Показать подсказку"}</button>
        {showHint && <aside>{challenge.hint}</aside>}
        {run.status === "success" && <aside className="sec-explain"><b>Почему это работает</b><p>{withInlineCode(challenge.explain)}</p></aside>}
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
          <button className={tab === "harness" ? "active" : ""} onClick={() => setTab("harness")}>Что проверяется</button>
        </div>
        <div className={`sql-result ${tone}`}>
          {tab === "harness"
            ? <><header><b>Обычный ввод и атака</b><span>только для чтения</span></header><pre className="sql-error-text" style={{ color: "#b8efdb" }}>{challenge.harness}</pre></>
            : <>
                <header><b>Результат</b><span>{busy ? "Выполняется…" : run.status === "idle" ? "Предпросмотр" : run.status}</span></header>
                {busy && <p>{loadMessage}</p>}
                {!busy && run.status === "idle" && <p>Нажмите «Выполнить», чтобы увидеть, что делает код при обычном вводе и при атаке.</p>}
                {!busy && ["compile-error", "runtime-error", "network-error"].includes(run.status) && <pre className="sql-error-text">{run.message}</pre>}
                {!busy && ["ran", "success", "mismatch"].includes(run.status) && <pre className="sql-error-text" style={{ color: "#eaf4f0" }}>{run.stdout || "(пустой вывод)"}</pre>}
              </>}
          {run.status === "success" && <div className="sql-verdict success"><CheckCircle size={18}/> Атака отражена, обычный ввод работает. {nextChallenge && <button className="sec-next" onClick={() => navigate(`/security/practice/${nextChallenge.id}`)}>Следующая задача <ArrowRight size={14}/></button>}</div>}
          {run.status === "mismatch" && <div className="sql-verdict error"><XCircle size={18}/> Код выполнился, но результат отличается от безопасного. {challenge.hint}</div>}
        </div>
      </section>
    </div>
  </main>;
}

function withOrigin(blocks) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return blocks.map((block) => (block.type === "code" && block.code.includes("{ORIGIN}") ? { ...block, code: block.code.replaceAll("{ORIGIN}", origin) } : block));
}

export function SecurityProject({ stageId, navigate }) {
  const stages = securityProjectStages;
  const index = Math.max(0, stages.findIndex((stage) => stage.id === stageId));
  const stage = stages[index];
  const sprint = securityProject.sprints.find((item) => `sprint-${item.number}` === stage.id);
  const page = sprint || (stage.id === "setup" ? securityProject.setup : securityProject.overview);
  const [completed, setCompleted] = useState(() => new Set(getCompletedLessonIds(PROJECT_SLUG)));
  const previous = stages[index - 1];
  const next = stages[index + 1];
  const finish = () => {
    if (sprint) { markLessonComplete(PROJECT_SLUG, stage.id); setCompleted((ids) => new Set(ids).add(stage.id)); }
    navigate(next ? next.path : "/security");
  };
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return <div className="learning-layout">
    <aside className="stage-sidebar" aria-label="Этапы проекта">
      <button className="stage-course-link" onClick={() => navigate("/security")}><ArrowLeft size={16}/> К курсу</button>
      <small>ПРОЕКТ</small>
      <h2>Заметки</h2>
      <nav>{stages.map((item) => <button key={item.id} className={item.id === stage.id ? "active" : ""} aria-current={item.id === stage.id ? "page" : undefined} onClick={() => navigate(item.path)}>
        {completed.has(item.id) ? <CheckCircle size={18} weight="fill"/> : <span className="sec-stage-dot"/>}<span>{item.title}</span></button>)}</nav>
    </aside>
    <div className="mobile-stage-nav">
      <span>{index + 1} / {stages.length}</span>
      <select aria-label="Текущий этап" value={stage.id} onChange={(event) => navigate(stages.find((item) => item.id === event.target.value).path)}>
        {stages.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}
      </select>
    </div>
    <main className="learning-main"><article className="learning-article">
      <header className="learning-header">
        <small>{sprint ? `СПРИНТ ${sprint.number} ИЗ ${securityProject.sprints.length} · ${sprint.time.toUpperCase()}` : "ПРОЕКТ КУРСА"}</small>
        <h1>{sprint ? sprint.title : stage.id === "setup" ? "Подготовка" : securityProject.title}</h1>
        {sprint && <p>{sprint.goal} Результат: {sprint.result}</p>}
      </header>
      {stage.id === "setup" && <div className="sec-downloads">
        <a href={`${origin}/security-notes/app.py`} download>Скачать app.py</a>
        <a href={`${origin}/security-notes/check.py`} download>Скачать check.py</a>
      </div>}
      <LessonBlocks blocks={withOrigin(page.blocks)}/>
      <footer className="lesson-footer sec-project-footer">
        <div className="lesson-pager">
          {previous && <button onClick={() => navigate(previous.path)}><ArrowLeft size={17}/> {previous.title}</button>}
          <button className="story-next" onClick={finish}>{sprint ? "Спринт пройден" : "Дальше"}{next ? <> · {next.title}</> : <> · к курсу</>} <ArrowRight size={17}/></button>
        </div>
      </footer>
    </article></main>
  </div>;
}
