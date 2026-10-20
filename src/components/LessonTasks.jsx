import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CaretRight, CheckCircle, Circle, Lightbulb, List, Lock, Play, X, XCircle } from "@phosphor-icons/react";
import { authoredLessonIds } from "../content/courseCurriculum.js";
import { courseLessonPath } from "../content/courseDraft.js";
import { getLessonTasks } from "../content/goLessonTasks/index.js";
import { assembleSource, runGoProgram } from "../lib/goPlayground.js";
import { recordPractice } from "../lib/activity.js";
import { getCompletedLessonIds } from "../lib/progress.js";
import { GO_COURSE, authoredGoLessons, findGoLesson, getSolvedTaskKeys, lessonAccess, markTaskSolved, taskPath } from "../lib/goCourseProgress.js";
import { runStatusLabel } from "../lib/runStatus.js";
import { LessonBlocks } from "./LessonBlocks.jsx";
import "../styles-sql.css";

// Меню программы: темы текущего модуля и их уроки со статусом. Открывается из урока и из задания.
export function ProgramDrawer({ lesson, navigate, onClose }) {
  const completed = new Set(getCompletedLessonIds(GO_COURSE));
  return <div className="lt-drawer-backdrop" role="presentation" onMouseDown={onClose}>
    <nav className="lt-drawer" aria-label="Программа модуля" onMouseDown={(event) => event.stopPropagation()}>
      <header>
        <div><small>{lesson.section.phase}</small><b>{lesson.section.title}</b></div>
        <button type="button" onClick={onClose} aria-label="Закрыть программу"><X size={22}/></button>
      </header>
      {lesson.section.topics.map((topic) => <section key={topic.id}>
        <h3>{topic.title}</h3>
        <ol>{topic.lessons.filter((item) => authoredLessonIds.has(item.id)).map((item) => {
          const access = lessonAccess(authoredGoLessons, item.id, completed);
          const current = item.id === lesson.id;
          const done = completed.has(item.id);
          return <li key={item.id}>
            <button type="button" className={current ? "current" : ""} disabled={!access.unlocked} aria-current={current ? "page" : undefined} onClick={() => { onClose(); navigate(courseLessonPath({ ...item, topic, section: lesson.section })); }}>
              {done ? <CheckCircle size={18} weight="fill" aria-label="Пройден"/> : access.unlocked ? <Circle size={18} aria-hidden="true"/> : <Lock size={18} aria-label="Закрыт"/>}
              <span>{item.title}</span>
            </button>
          </li>;
        })}</ol>
      </section>)}
      <button type="button" className="lt-drawer-all" onClick={() => { onClose(); navigate("/go"); }}>Вся программа курса <ArrowRight size={16}/></button>
    </nav>
  </div>;
}

// Экран урока, который ещё закрыт: уроки открываются по порядку.
export function LockedLesson({ lesson, blockedBy, navigate }) {
  return <main className="lt-locked">
    <Lock size={40} aria-hidden="true"/>
    <h1>Урок «{lesson.title}» пока закрыт</h1>
    <p>Уроки открываются по порядку. Сначала пройди урок «{blockedBy.title}»{getLessonTasks(blockedBy.id).length ? " и реши его задания" : ""}.</p>
    <div>
      <button type="button" className="lt-button" onClick={() => navigate(courseLessonPath(blockedBy))}>Открыть урок «{blockedBy.title}» <ArrowRight size={17}/></button>
      <button type="button" className="lt-button secondary" onClick={() => navigate("/go")}>К программе</button>
    </div>
  </main>;
}

function verdictFor(status) {
  if (status === "success") return { tone: "success", text: "Верно. Можно идти дальше." };
  if (status === "mismatch") return { tone: "error", text: "Программа работает, но вывод не совпадает с ожидаемым. Сравни свой вывод с условием или открой подсказку." };
  if (status === "compile-error") return { tone: "error", text: "Код не компилируется. Ошибка показана в окне результата." };
  if (status === "runtime-error") return { tone: "error", text: "Программа упала во время работы. Подробности в окне результата." };
  if (status === "network-error") return { tone: "error", text: "Не удалось связаться с сервером запуска. Проверь интернет и попробуй ещё раз." };
  if (status === "wrong") return { tone: "error", text: "Пока неверно. Перечитай вопрос или открой теорию к заданию." };
  return null;
}

function CodeTask({ task, onSolved, solved, onStatus }) {
  const [code, setCode] = useState(task.starter);
  const [busy, setBusy] = useState(false);
  const [run, setRunState] = useState({ status: solved ? "success" : "idle", stdout: "", message: "" });
  const setRun = (next) => { setRunState(next); onStatus(next.status); };
  const [confirmReset, setConfirmReset] = useState(false);

  const start = async (check) => {
    setBusy(true);
    recordPractice("go");
    try {
      const mine = await runGoProgram(assembleSource(code, task.harness));
      if (!check || mine.status !== "ok") {
        setRun({ status: mine.status === "ok" ? "ran" : mine.status, stdout: mine.stdout, message: mine.message });
        return;
      }
      const reference = await runGoProgram(assembleSource(task.referenceSolution, task.harness));
      const matched = reference.status === "ok" && reference.stdout === mine.stdout;
      setRun({ status: matched ? "success" : "mismatch", stdout: mine.stdout, message: "" });
      if (matched) onSolved();
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return <section className="sql-editor lt-editor">
    <div className="sql-editor-top"><b>main.go</b><span>запускается на play.golang.org</span></div>
    <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" autoCapitalize="off" autoCorrect="off" aria-label={`Код задания «${task.title}»`}/>
    <div className="sql-runbar">
      <button type="button" onClick={() => setConfirmReset(true)}>Начать заново</button>
      <button type="button" className="secondary" onClick={() => start(false)} disabled={busy}><Play size={15} weight="fill"/> Запустить</button>
      <button type="button" className="primary" onClick={() => start(true)} disabled={busy}>Проверить</button>
    </div>
    <div className={`sql-result ${verdictFor(run.status)?.tone || ""}`} aria-live="polite">
      <header><b>Результат</b><span>{busy ? "Выполняется…" : runStatusLabel(run.status)}</span></header>
      {busy && <p>Компилируем и запускаем…</p>}
      {!busy && run.status === "idle" && <p>«Запустить» покажет вывод программы, «Проверить» сравнит его с ожидаемым.</p>}
      {!busy && ["compile-error", "runtime-error", "network-error"].includes(run.status) && <pre className="sql-error-text">{run.message}</pre>}
      {!busy && ["ran", "mismatch"].includes(run.status) && <pre className="sql-error-text sql-plain-text">{run.stdout || "(пустой вывод)"}</pre>}
      {!busy && run.status === "success" && run.stdout && <pre className="sql-error-text sql-plain-text">{run.stdout}</pre>}
      {!busy && run.status === "success" && !run.stdout && <p>Задание уже решено.</p>}
    </div>
    {confirmReset && <div className="lt-dialog" role="alertdialog" aria-modal="true" aria-labelledby="lt-reset-title">
      <div>
        <h2 id="lt-reset-title">Начать заново?</h2>
        <p>Код вернётся к исходной заготовке, твои изменения пропадут.</p>
        <div><button type="button" className="lt-button" onClick={() => { setCode(task.starter); setRun({ status: "idle", stdout: "", message: "" }); setConfirmReset(false); }}>Начать заново</button><button type="button" className="lt-button secondary" onClick={() => setConfirmReset(false)}>Отмена</button></div>
      </div>
    </div>}
  </section>;
}

function QuizTask({ task, onSolved, solved, onStatus }) {
  const [selected, setSelected] = useState(null);
  const [status, setStatusState] = useState(solved ? "success" : "idle");
  const setStatus = (next) => { setStatusState(next); onStatus(next); };
  const options = task.options.map((option) => option.replace(/^\*/, ""));
  const correct = task.options.findIndex((option) => option.startsWith("*"));
  const check = () => {
    if (selected === correct) { setStatus("success"); onSolved(); } else setStatus("wrong");
  };
  return <section className="lt-quiz">
    <fieldset>
      <legend>{task.question}</legend>
      {options.map((option, index) => <label key={option} className={status === "success" && index === correct ? "correct" : status === "wrong" && index === selected ? "wrong" : ""}>
        <input type="radio" name={`quiz-${task.key}`} checked={selected === index} onChange={() => { setSelected(index); if (status === "wrong") setStatus("idle"); }}/>
        <span>{option}</span>
      </label>)}
    </fieldset>
    <div className="lt-quiz-actions"><button type="button" className="lt-button" disabled={selected === null && status !== "success"} onClick={check}>Проверить</button></div>
    {status === "success" && <p className="lt-quiz-explain">{task.explanation}</p>}
  </section>;
}

// Тренажёр урока: задание, редактор или вопрос, проверка и «Далее».
export function LessonTaskPage({ lessonId, number, navigate }) {
  const lesson = findGoLesson(lessonId);
  const tasks = lesson ? getLessonTasks(lesson.id) : [];
  const index = Math.min(Math.max(number - 1, 0), Math.max(tasks.length - 1, 0));
  const task = tasks[index];
  const [solvedKeys, setSolvedKeys] = useState(getSolvedTaskKeys);
  const [status, setStatus] = useState("idle");
  const [hint, setHint] = useState(false);
  const [theory, setTheory] = useState(false);
  const [menu, setMenu] = useState(false);
  const [justSolved, setJustSolved] = useState(false);

  const solved = task ? solvedKeys.has(task.key) : false;
  const onSolved = () => {
    markTaskSolved(lesson.id, task.key);
    setSolvedKeys(getSolvedTaskKeys());
    setJustSolved(true);
  };
  if (!lesson || !task) return <main className="lt-locked"><h1>У этого урока нет заданий</h1><button type="button" className="lt-button" onClick={() => navigate("/go")}>К программе</button></main>;
  const access = lessonAccess(authoredGoLessons, lesson.id);
  if (!access.unlocked) return <LockedLesson lesson={lesson} blockedBy={access.blockedBy} navigate={navigate}/>;

  const lessonIndex = authoredGoLessons.findIndex((item) => item.id === lesson.id);
  const nextLesson = authoredGoLessons[lessonIndex + 1];
  const topicIndex = lesson.section.topics.findIndex((item) => item.id === lesson.topic.id);
  const lessonInTopic = lesson.topic.lessons.findIndex((item) => item.id === lesson.id);
  const isLast = index === tasks.length - 1;
  const goNext = () => navigate(isLast ? (nextLesson ? courseLessonPath(nextLesson) : "/go") : taskPath(lesson, index + 2));
  const verdict = verdictFor(status) || (solved ? verdictFor("success") : null);

  return <main className="sql-task-shell lt-shell">
    <header className="lt-top">
      <div className="lt-top-left">
        <button type="button" onClick={() => setMenu(true)} aria-label="Программа модуля"><List size={20}/></button>
        <button type="button" onClick={() => navigate(courseLessonPath(lesson))}><ArrowLeft size={17}/> <span>К теории урока</span></button>
      </div>
      <p className="lt-crumb"><span>Тема {topicIndex + 1}/{lesson.section.topics.length}: {lesson.topic.title}</span><CaretRight size={12} aria-hidden="true"/><span>Урок {lessonInTopic + 1}/{lesson.topic.lessons.length}</span><CaretRight size={12} aria-hidden="true"/><b>Задание {index + 1}/{tasks.length}</b></p>
      <button type="button" className="lt-theory-toggle" onClick={() => setTheory(true)}><BookOpen size={18}/> <span>Теория</span></button>
    </header>
    <ol className="lt-steps" aria-label="Задания урока">{tasks.map((item, position) => <li key={item.key}>
      <button type="button" className={`${solvedKeys.has(item.key) ? "done" : ""} ${position === index ? "current" : ""}`} aria-current={position === index ? "step" : undefined} aria-label={`Задание ${position + 1}: ${item.title}${solvedKeys.has(item.key) ? ", решено" : ""}`} onClick={() => navigate(taskPath(lesson, position + 1))}/>
    </li>)}</ol>
    <div className={`sql-task-grid lt-grid ${task.kind === "quiz" ? "lt-grid-quiz" : ""}`}>
      <section className="sql-task-brief lt-brief">
        {verdict && <div className={`lt-verdict ${verdict.tone}`} role="status">{verdict.tone === "success" ? <CheckCircle size={20} weight="fill"/> : <XCircle size={20} weight="fill"/>}<span>{verdict.text}</span></div>}
        <p className="academy-kicker">ЗАДАНИЕ {index + 1} ИЗ {tasks.length} · ОКОЛО {task.minutes} МИН</p>
        <h1>{task.title}</h1>
        <p>{task.kind === "quiz" ? "Выбери один вариант и нажми «Проверить»." : task.description}</p>
        {task.kind !== "quiz" && <button type="button" className="lt-hint-toggle" onClick={() => setHint((value) => !value)} aria-expanded={hint}><Lightbulb size={17}/> {hint ? "Скрыть подсказку" : "Подсказка"}</button>}
        {hint && task.kind !== "quiz" && <aside>{task.hint}</aside>}
        {task.kind !== "quiz" && <details className="lt-harness"><summary>Как проверяется решение</summary><p>Проверка запускает твой код с этой функцией main и сравнивает вывод с правильным.</p><pre>{task.harness}</pre></details>}
        {(solved || justSolved) && <button type="button" className="lt-button lt-next" onClick={goNext}>{isLast ? (nextLesson ? "Следующий урок" : "К программе") : "Далее"} <ArrowRight size={17}/></button>}
      </section>
      {task.kind === "quiz" ? <QuizTask task={task} solved={solved} onSolved={onSolved} onStatus={setStatus}/> : <CodeTask task={task} solved={solved} onSolved={onSolved} onStatus={setStatus}/>}
    </div>
    {theory && <div className="lt-drawer-backdrop" role="presentation" onMouseDown={() => setTheory(false)}>
      <aside className="lt-drawer lt-drawer-right" aria-label="Теория урока" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><small>ТЕОРИЯ К ЗАДАНИЮ</small><b>{lesson.title}</b></div><button type="button" onClick={() => setTheory(false)} aria-label="Закрыть теорию"><X size={22}/></button></header>
        <div className="lt-theory"><LessonBlocks blocks={lesson.blocks}/></div>
      </aside>
    </div>}
    {menu && <ProgramDrawer lesson={lesson} navigate={navigate} onClose={() => setMenu(false)}/>}
  </main>;
}
