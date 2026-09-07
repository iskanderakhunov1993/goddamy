import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { flatLessons, getLessonPath } from "../content/courseCurriculum.js";

const STATIC_ENTRIES = [
  { kind: "Курс", title: "Go Backend Internship", subtitle: "141 урок · Task Tracker, Expense Tracker, URL Shortener", path: "/go" },
  { kind: "Курс", title: "SQL для работы с данными", subtitle: "Тренажёр доступен, уроки в разработке", path: "/sql" },
  { kind: "Курс", title: "Python", subtitle: "Тренажёр доступен, уроки в разработке", path: "/python" },
  { kind: "Курс", title: "Product Management", subtitle: "Программа готовится", path: "/product" },
  { kind: "Курс", title: "QA", subtitle: "Тренажёр доступен, уроки в разработке", path: "/qa" },
  { kind: "Раздел", title: "Тренажёр Go", subtitle: "Практика по темам курса", path: "/go/practice" },
  { kind: "Раздел", title: "Профиль и прогресс", subtitle: "Курсы, достижения, сертификат", path: "/profile" },
  { kind: "Раздел", title: "Сертификаты", subtitle: "Статус по каждому курсу", path: "/certificates" },
  { kind: "Раздел", title: "Подписка", subtitle: "Тариф и оформление", path: "/subscription" },
];

const LESSON_ENTRIES = flatLessons.map((item) => ({
  kind: "Урок",
  title: item.title,
  subtitle: `${item.section.title} · ${item.topic.title}`,
  path: getLessonPath(item),
}));

const ALL_ENTRIES = [...STATIC_ENTRIES, ...LESSON_ENTRIES];

export function SearchOverlay({ navigate, onClose }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STATIC_ENTRIES.slice(0, 6);
    return ALL_ENTRIES.filter((entry) =>
      entry.title.toLowerCase().includes(q) || entry.subtitle.toLowerCase().includes(q),
    ).slice(0, 20);
  }, [query]);

  const go = (path) => { onClose(); navigate(path); };

  return <div className="search-overlay-backdrop" role="presentation" onMouseDown={onClose}>
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Поиск по платформе" onMouseDown={(event) => event.stopPropagation()}>
      <div className="search-overlay-input">
        <MagnifyingGlass size={19}/>
        <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Курс, урок, раздел…"/>
        <button aria-label="Закрыть поиск" onClick={onClose}><X size={19}/></button>
      </div>
      <div className="search-overlay-results">
        {results.length ? results.map((entry) => <button key={`${entry.kind}-${entry.title}-${entry.path}`} onClick={() => go(entry.path)}>
          <span className="search-result-kind">{entry.kind}</span>
          <span className="search-result-body"><b>{entry.title}</b><small>{entry.subtitle}</small></span>
        </button>) : <p className="search-overlay-empty">Ничего не найдено по «{query}».</p>}
      </div>
    </div>
  </div>;
}
