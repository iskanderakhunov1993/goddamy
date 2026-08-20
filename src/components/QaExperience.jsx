import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, MagnifyingGlass, SlidersHorizontal, XCircle,
} from "@phosphor-icons/react";
import { getQaChallenge, qaChallenges } from "../content/qaChallenges.js";
import { recordPractice } from "../lib/activity.js";
import "../styles-qa.css";

export { getQaChallenge, qaChallenges };

function QaContextNav({ navigate, active }) {
  return (
    <nav className="course-context-nav qa-context" aria-label="Разделы курса QA">
      <button onClick={() => navigate("/")}><ArrowLeft size={16}/> Все направления</button>
      <div>
        <button className={active === "course" ? "active" : ""} onClick={() => navigate("/qa")}>Курс QA</button>
        <button className={active === "practice" ? "active" : ""} onClick={() => navigate("/qa/practice")}>Практика</button>
      </div>
    </nav>
  );
}

export function QaTrainer({ navigate }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Все");
  const [category, setCategory] = useState("Все");
  const categories = ["Все", ...new Set(qaChallenges.map((item) => item.category))];
  const filtered = useMemo(
    () => qaChallenges.filter((item) =>
      (level === "Все" || item.level === level) &&
      (category === "Все" || item.category === category) &&
      item.title.toLowerCase().includes(query.toLowerCase())),
    [query, level, category],
  );
  return (
    <main className="go-practice-shell qa-practice-shell">
      <QaContextNav navigate={navigate} active="practice"/>
      <div className="go-trainer container">
        <header className="go-trainer-header">
          <div>
            <p className="academy-kicker">ПРАКТИКА · QA</p>
            <h1>QA-тренажёр</h1>
            <p>Разбирайте кейсы Bit Tech: приоритизация, тест-дизайн, баг-репорты, API и регрессия — с проверкой ответа.</p>
          </div>
          <div className="trainer-progress-note">
            <CheckCircle size={20}/>
            <span><b>Практика курса</b><small>Каждая задача связана с темой модуля и рабочей ситуацией QA.</small></span>
          </div>
        </header>
        <section className="go-trainer-filters">
          <div className="trainer-filter-row">
            <div className="trainer-levels">
              {["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => (
                <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>
              ))}
            </div>
            <label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск QA-задачи"/></label>
          </div>
          <div className="trainer-categories">
            <SlidersHorizontal size={17}/>
            {categories.map((item) => (
              <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>
            ))}
          </div>
        </section>
        <section className="go-task-list">
          {filtered.map((item, index) => (
            <button onClick={() => navigate(`/qa/practice/${item.id}`)} key={item.id}>
              <span className={`academy-dot level-${item.level}`}/>
              <b>{String(index + 1).padStart(2, "0")}. {item.title}</b>
              <em>{item.category}</em>
              <small>{item.level} · {item.minutes} мин</small>
              <ArrowRight size={18}/>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

function ChoiceOrChecklist({ challenge, state, setState }) {
  const isChecklist = challenge.type === "checklist";
  const selected = state.selected;
  const toggle = (option) => {
    if (isChecklist) {
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
      setState({ ...state, selected: next, status: "idle" });
    } else {
      setState({ ...state, selected: [option], status: "idle" });
    }
  };
  const check = () => {
    recordPractice("qa");
    const correctSet = isChecklist ? challenge.correct : [challenge.options[challenge.correct]];
    const ok = correctSet.length === selected.length && correctSet.every((item) => selected.includes(item));
    setState({ ...state, status: ok ? "success" : "error" });
  };
  return (
    <>
      <div className="qa-options">
        {challenge.options.map((option) => (
          <label key={option} className={`qa-option ${state.status !== "idle" ? (isCorrectOption(challenge, option) ? "reveal-correct" : selected.includes(option) ? "reveal-wrong" : "") : ""}`}>
            <input
              type={isChecklist ? "checkbox" : "radio"}
              name="qa-answer"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <div className="qa-runbar">
        <button onClick={() => setState({ selected: [], status: "idle" })}>Сбросить</button>
        <button className="primary" disabled={selected.length === 0} onClick={check}>Проверить ответ</button>
      </div>
      {state.status !== "idle" && (
        <div className={`qa-result ${state.status}`}>
          <header>{state.status === "success" ? <CheckCircle size={18}/> : <XCircle size={18}/>}<b>{state.status === "success" ? "Верно" : "Пока не совпадает"}</b></header>
          <p>{challenge.explanation}</p>
        </div>
      )}
    </>
  );
}

function isCorrectOption(challenge, option) {
  return challenge.type === "checklist" ? challenge.correct.includes(option) : challenge.options[challenge.correct] === option;
}

function BugReportForm({ challenge, state, setState }) {
  const values = state.values;
  const setField = (id, value) => setState({ ...state, values: { ...values, [id]: value }, status: "idle" });
  const check = () => {
    recordPractice("qa");
    const complete = challenge.fields.every((field) => (values[field.id] || "").trim().length > 0) && Boolean(values.severity);
    setState({ ...state, status: complete ? "success" : "error" });
  };
  return (
    <>
      <div className="qa-bug-form">
        {challenge.fields.map((field) => (
          <label key={field.id} className="qa-field">
            <span>{field.label}</span>
            <textarea rows={field.id === "steps" ? 4 : 2} placeholder={field.placeholder} value={values[field.id] || ""} onChange={(event) => setField(field.id, event.target.value)}/>
          </label>
        ))}
        <label className="qa-field">
          <span>Severity</span>
          <div className="qa-severity-row">
            {challenge.severities.map((item) => (
              <button type="button" key={item} className={values.severity === item ? "active" : ""} onClick={() => setField("severity", item)}>{item}</button>
            ))}
          </div>
        </label>
      </div>
      <div className="qa-runbar">
        <button onClick={() => setState({ values: {}, status: "idle" })}>Очистить</button>
        <button className="primary" onClick={check}>Проверить репорт</button>
      </div>
      {state.status !== "idle" && (
        <div className={`qa-result ${state.status}`}>
          <header>{state.status === "success" ? <CheckCircle size={18}/> : <XCircle size={18}/>}<b>{state.status === "success" ? "Все поля заполнены" : "Заполните все поля и выберите severity"}</b></header>
          <p>{challenge.explanation}</p>
          <div className="qa-model-answer">
            <small>ПРИМЕР СИЛЬНОГО РЕПОРТА</small>
            <b>{challenge.model.title}</b>
            <pre>{challenge.model.steps}</pre>
            <p><b>Ожидаемый:</b> {challenge.model.expected}</p>
            <p><b>Фактический:</b> {challenge.model.actual}</p>
            <p><b>Severity:</b> {challenge.model.severity}</p>
          </div>
        </div>
      )}
    </>
  );
}

export function QaTask({ challengeId, navigate }) {
  const challenge = getQaChallenge(challengeId);
  const [state, setState] = useState({ selected: [], values: {}, status: "idle" });
  return (
    <main className="qa-task-shell">
      <header>
        <button onClick={() => navigate("/qa/practice")}><ArrowLeft size={17}/> Все задачи</button>
        <span>QA · Bit Tech</span>
        <button onClick={() => navigate("/qa")}>Программа курса</button>
      </header>
      <div className="qa-task-grid">
        <section className="qa-task-brief">
          <p className="academy-kicker">{challenge.level.toUpperCase()} · {challenge.minutes} МИН · {challenge.category.toUpperCase()}</p>
          <h1>{challenge.title}</h1>
          <p>{challenge.scenario}</p>
          {challenge.question && <div className="qa-question"><b>{challenge.question}</b></div>}
        </section>
        <section className="qa-task-answer">
          {challenge.type === "bug-report"
            ? <BugReportForm challenge={challenge} state={state} setState={setState}/>
            : <ChoiceOrChecklist challenge={challenge} state={state} setState={setState}/>}
        </section>
      </div>
    </main>
  );
}
