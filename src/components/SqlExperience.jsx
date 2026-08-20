import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, CheckCircle, MagnifyingGlass, Play,
  SlidersHorizontal, XCircle,
} from "@phosphor-icons/react";
import "../styles-sql.css";
import { CourseCabinet } from "./CourseCabinet.jsx";
import { getSqlChallenge, sqlChallenges } from "../content/sqlChallenges.js";
import { sqlSchemaColumns, sqlSchemaTables } from "../content/sqlSchema.js";
import { compareResults, createSeededDatabase, runQuery } from "../lib/sqlEngine.js";
import { recordPractice } from "../lib/activity.js";

export { getSqlChallenge, sqlChallenges };

export const sqlModules = [
  { n: "01", title: "Данные и реляционные базы", text: "Разберитесь, как устроены таблицы, строки, ключи и связи.", topics: ["Как хранятся данные", "Таблицы и типы", "Первичные ключи", "Связи между таблицами"] },
  { n: "02", title: "Первые SELECT-запросы", text: "Получайте нужные столбцы и исключайте повторы.", topics: ["SELECT и FROM", "Псевдонимы", "DISTINCT", "Вычисляемые поля"] },
  { n: "03", title: "Фильтрация и сортировка", text: "Находите нужные строки по условиям бизнес-задачи.", topics: ["WHERE", "AND, OR и NOT", "NULL, BETWEEN и IN", "LIKE", "ORDER BY"] },
  { n: "04", title: "Агрегация и отчёты", text: "Собирайте показатели и проверяйте продуктовые гипотезы.", topics: ["COUNT, SUM и AVG", "GROUP BY", "HAVING", "CASE", "Отчёт по операциям"] },
  { n: "05", title: "Связи и подзапросы", text: "Объединяйте данные из нескольких сущностей.", topics: ["INNER JOIN", "LEFT JOIN", "Несколько JOIN", "Подзапросы", "CTE"] },
  { n: "06", title: "Рабочий SQL-проект", text: "Проведите исследование данных криптобанка и защитите результат.", topics: ["Бриф аналитика", "Декомпозиция запроса", "Проверка качества", "Оптимизация", "Итоговый отчёт"] },
];

function SqlContextNav({ navigate, active }) {
  return <nav className="course-context-nav sql-context" aria-label="Разделы курса SQL"><button onClick={() => navigate("/")}><ArrowLeft size={16}/> Все направления</button><div><button className={active === "course" ? "active" : ""} onClick={() => navigate("/sql")}>Курс SQL</button><button className={active === "practice" ? "active" : ""} onClick={() => navigate("/sql/practice")}>Практика</button></div></nav>;
}

export function SqlCoursePage({ navigate }) {
  return <CourseCabinet navigate={navigate} course={{ slug: "sql", label: "SQL", kicker: "АНАЛИТИКА · BIT TECH", title: "SQL для работы с данными", description: "От первой выборки до итогового исследования операций криптобанка.", modules: sqlModules, phases: ["СТАРТ", "ОСНОВЫ", "ФИЛЬТРАЦИЯ", "ОТЧЁТЫ", "СВЯЗИ", "ПРОЕКТ"], role: "Текущая роль: младший аналитик данных.", nextStep: "Пройдите основы, решите первые запросы и подготовьте итоговый отчёт.", practicePath: "/sql/practice", firstPath: "/sql/practice/active-clients", startLabel: "Начать обучение" }}/>;
}

export function SqlTrainer({ navigate }) {
  const [query, setQuery] = useState(""); const [level, setLevel] = useState("Все"); const [category, setCategory] = useState("Все");
  const categories = ["Все", ...new Set(sqlChallenges.map((item) => item.category))];
  const filtered = useMemo(() => sqlChallenges.filter((item) => (level === "Все" || item.level === level) && (category === "Все" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())), [query, level, category]);
  return <main className="go-practice-shell sql-practice-shell"><SqlContextNav navigate={navigate} active="practice"/><div className="go-trainer container"><header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · SQL</p><h1>SQL-тренажёр</h1><p>Пишите настоящие запросы против живой базы криптобанка — движок выполняет SQL прямо в браузере.</p></div><div className="trainer-progress-note"><CheckCircle size={20}/><span><b>Практика курса</b><small>Каждая задача связана с темой и будущим итоговым отчётом.</small></span></div></header><section className="go-trainer-filters"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}>{item}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск SQL-задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section><section className="go-task-list">{filtered.map((item, index) => <button onClick={() => navigate(`/sql/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>)}</section></div></main>;
}

function ResultTable({ columns, rows, emptyLabel }) {
  if (columns.length === 0) return <p>{emptyLabel}</p>;
  return <table><thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell === null ? "NULL" : String(cell)}</td>)}</tr>)}</tbody></table>;
}

export function SqlTask({ challengeId, navigate }) {
  const challenge = getSqlChallenge(challengeId);
  const [code, setCode] = useState(challenge.starter);
  const [db, setDb] = useState(null);
  const [dbError, setDbError] = useState("");
  const [tab, setTab] = useState("result");
  const [run, setRun] = useState({ status: "idle", columns: [], rows: [], message: "" });
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createSeededDatabase()
      .then((instance) => { if (!cancelled) setDb(instance); })
      .catch((error) => { if (!cancelled) setDbError(error.message || "Не удалось запустить SQL-движок"); });
    return () => { cancelled = true; };
  }, []);

  const execute = () => {
    if (!db) return;
    recordPractice("sql");
    try {
      const result = runQuery(db, code);
      setRun({ status: "ran", ...result, message: "" });
      setTab("result");
    } catch (error) {
      setRun({ status: "syntax-error", columns: [], rows: [], message: error.message });
      setTab("result");
    }
  };

  const submit = () => {
    if (!db) return;
    recordPractice("sql");
    try {
      const userResult = runQuery(db, code);
      const referenceResult = runQuery(db, challenge.referenceQuery);
      const ok = compareResults(userResult, referenceResult, challenge.ordered);
      setRun({ status: ok ? "success" : "mismatch", ...userResult, message: "" });
      setTab("result");
    } catch (error) {
      setRun({ status: "syntax-error", columns: [], rows: [], message: error.message });
      setTab("result");
    }
  };

  const activeTable = sqlSchemaTables.includes(tab) ? tab : null;
  const tablePreview = useMemo(() => {
    if (!db || !activeTable) return null;
    try {
      return runQuery(db, `SELECT * FROM ${activeTable} LIMIT 20;`);
    } catch {
      return null;
    }
  }, [db, activeTable]);

  return <main className="sql-task-shell"><header><button onClick={() => navigate("/sql/practice")}><ArrowLeft size={17}/> Все задачи</button><span>SQL · SQLite в браузере</span><button onClick={() => navigate("/sql")}>Программа курса</button></header><div className="sql-task-grid"><section className="sql-task-brief"><p className="academy-kicker">{challenge.level.toUpperCase()} · {challenge.minutes} МИН</p><h1>{challenge.title}</h1><p>{challenge.description}</p><div className="sql-schema"><small>СХЕМА БАЗЫ</small>{sqlSchemaTables.map((table) => <div key={table}><b>{table}</b><span>{sqlSchemaColumns[table].join(" · ")}</span></div>)}</div><button onClick={() => setShowHint((value) => !value)}>{showHint ? "Скрыть подсказку" : "Показать подсказку"}</button>{showHint && <aside>{challenge.hint}</aside>}</section><section className="sql-editor"><div className="sql-editor-top"><b>query.sql</b><span>{db ? "SQLite · готово" : dbError ? "Ошибка движка" : "Загрузка движка…"}</span></div><textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="Редактор SQL-запроса"/><div className="sql-runbar"><button onClick={() => setCode(challenge.starter)}>Сбросить</button><button className="secondary" onClick={execute} disabled={!db}><Play size={15} weight="fill"/> Выполнить</button><button className="primary" onClick={submit} disabled={!db}>Отправить <ArrowRight size={16}/></button></div><div className="sql-result-tabs"><button className={tab === "result" ? "active" : ""} onClick={() => setTab("result")}>Результат</button>{sqlSchemaTables.map((table) => <button className={tab === table ? "active" : ""} onClick={() => setTab(table)} key={table}>{table}</button>)}</div><div className={`sql-result ${run.status === "success" ? "success" : run.status === "mismatch" ? "error" : run.status === "syntax-error" ? "error" : ""}`}>
    {tab !== "result"
      ? <><header><b>{tab}</b><span>{tablePreview ? `${tablePreview.rows.length} строк(и)` : "предпросмотр"}</span></header><ResultTable columns={tablePreview?.columns || []} rows={tablePreview?.rows || []} emptyLabel="Нет данных для предпросмотра."/></>
      : <>
          <header><b>Результат</b><span>{run.status === "idle" ? "Предпросмотр" : run.status === "syntax-error" ? "Ошибка запроса" : `${run.rows.length} строки`}</span></header>
          {run.status === "idle" && <p>{dbError || "Выполните запрос, чтобы увидеть данные."}</p>}
          {run.status === "syntax-error" && <p className="sql-error-text">{run.message}</p>}
          {(run.status === "ran" || run.status === "success" || run.status === "mismatch") && <ResultTable columns={run.columns} rows={run.rows} emptyLabel="Запрос выполнен, но ничего не вернул."/>}
        </>}
    {run.status === "success" && <div className="sql-verdict success"><CheckCircle size={18}/> Верно — результат совпал с эталонным.</div>}
    {run.status === "mismatch" && <div className="sql-verdict error"><XCircle size={18}/> Запрос выполнился, но результат пока не совпадает. {challenge.hint}</div>}
  </div></section></div></main>;
}
