import { useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, BracketsCurly, CheckCircle, Code,
  MagnifyingGlass, ShieldCheck, SlidersHorizontal,
  Stack, FilePy, Database, ChartLineUp, Cube,
} from "@phosphor-icons/react";

const GoLogoTile = () => <span className="tech-logo-tile">Go</span>;
import { getGoChallenge, goChallenges } from "../content/goChallenges.js";
import { saveProfileName } from "../lib/profile.js";
import "../styles-academy.css";

export { getGoChallenge, goChallenges };

export function PublicGoLanding({ navigate }) {
  const [name, setName] = useState("");
  const tracks = [
    { title: "Go Backend", status: "Доступен сейчас", description: "Создайте три backend-проекта и пройдите путь от первой строки до релиза.", icon: <GoLogoTile/>, level: "Для начинающих", meta: "150 уроков", action: () => navigate("/go") },
    { title: "SQL", status: "Доступен сейчас", description: "Научитесь получать данные, строить отчёты и принимать решения на их основе.", icon: <Database size={20}/>, level: "Для начинающих", meta: "140 уроков", action: () => navigate("/sql") },
    { title: "Python", status: "Доступен сейчас", description: "Автоматизируйте рабочие задачи и соберите сервис обработки данных.", icon: <FilePy size={20}/>, level: "Для начинающих", meta: "120 уроков", action: () => navigate("/python") },
    { title: "Product Management", status: "Доступен сейчас", description: "Научитесь исследовать проблему, выбирать метрики и вести продуктовую задачу к релизу.", icon: <ChartLineUp size={20}/>, level: "Для начинающих", meta: "90 уроков", action: () => navigate("/product") },
    { title: "QA", status: "Доступен сейчас", description: "Проверяйте требования, API и релизы, чтобы команда выпускала надёжный продукт.", icon: <ShieldCheck size={20}/>, level: "Для начинающих", meta: "90 уроков", action: () => navigate("/qa") },
    { title: "Docker", status: "Скоро", description: "Упакуйте приложение в контейнер и разверните его в любой среде.", icon: <Cube size={20}/>, level: "—", meta: "Программа готовится" },
  ];
  return <main className="universal-landing">
    <section className="universal-hero container">
      <div className="universal-hero-grid">
        <div className="universal-hero-copy">
          <h1><span className="hero-box white">Осваивайте</span><span className="hero-box yellow">/IT-профессию</span></h1>
          <p>Короткая теория, тренажёр с проверкой и три собственных проекта. Go, SQL, Python, Product и QA — по одной подписке.</p>
          <div className="universal-hero-actions"><button onClick={() => navigate("/go")}>Войти в команду <ArrowRight size={20}/></button><button onClick={() => navigate("/#courses")}>Выбрать направление</button></div>
          <div className="universal-subscription-note"><Stack size={20}/><span>Все курсы по одной подписке</span></div>
        </div>
        <form className="universal-signup" onSubmit={(event) => { event.preventDefault(); if (name.trim()) saveProfileName(name.trim()); navigate("/go"); }}>
          <b>Как тебя зовут?</b>
          <input placeholder="Имя" value={name} onChange={(event) => setName(event.target.value)}/>
          <button type="submit">Начать <ArrowRight size={16}/></button>
        </form>
      </div>
    </section>

    <section className="universal-courses container" id="courses">
      <p className="academy-kicker">НАПРАВЛЕНИЯ</p><h2>Каждый курс —<br/>рабочая история</h2>
      <ul className="universal-course-pills">{tracks.map((track) => <li key={track.title}><button onClick={() => track.action ? track.action() : navigate("/#courses")}>{track.title}</button></li>)}</ul>
      <ul className="universal-course-list">{tracks.map((track) => <li key={track.title}><button disabled={!track.action} onClick={track.action} className={track.action ? "available" : "coming"}>
        <div className="universal-track-icon">{track.icon}</div>
        <div className="universal-track-copy"><small>{track.status}</small><h3>{track.title}</h3><p>{track.description}</p><div className="universal-track-meta"><span>{track.level}</span><span>{track.meta}</span></div></div>
      </button></li>)}</ul>
    </section>

    <section className="universal-practice" id="practice"><div className="container"><div><p className="academy-kicker">ТОЛЬКО ВАЖНОЕ</p><h2>Не смотрите, как работают другие. Делайте сами.</h2></div><ol><li><b>Короткая теория</b><p>Только знания, нужные для следующей задачи.</p></li><li><b>Практика с проверкой</b><p>Тренажёр сразу показывает, что получилось.</p></li><li><b>Проект и сертификат</b><p>Результат можно открыть и показать другим.</p></li></ol></div></section>

    <section className="universal-certificate container" id="certificate"><ShieldCheck size={54}/><div><p className="academy-kicker">СЕРТИФИКАТЫ</p><h2>Курс — бесплатно. Сертификат — по подписке.</h2><p>Пройди курс полностью бесплатно и научись реально работать: весь материал и тренажёр открыты без оплаты. После завершения курса в профиле открывается сертификат. Чтобы скачать его, нужна подписка на платформу — оформи её в любой момент.</p></div><button onClick={() => navigate("/certificates")}>Посмотреть сертификаты <ArrowRight size={18}/></button></section>

    <section className="universal-subscription container" id="subscription"><div><p className="academy-kicker">ОДНА ПОДПИСКА</p><h2>Подписка нужна не для учёбы, а для результата</h2><p>Сам курс, тренажёр и проекты бесплатны. Подписка открывает право скачать сертификат, а вместе с ним — трек поиска работы и софт-скилы: резюме, собеседования, переговоры и работу в команде.</p></div><div className="universal-subscription-card"><CheckCircle size={31}/><h3>Что даёт подписка</h3><ul><li>Право скачать сертификат курса</li><li>Трек поиска работы</li><li>Софт-скилы: резюме, собеседования, команда</li><li>Доступ ко всем курсам платформы</li></ul><button onClick={() => navigate("/subscription")}>Оформить подписку <ArrowRight size={18}/></button><small>Курс и тренажёр остаются бесплатными в любом случае</small></div></section>
  </main>;
}

export function AcademyHub({ navigate }) {
  return <main className="academy-hub">
    <section className="academy-hub-hero container"><button className="academy-hub-back" onClick={() => navigate("/")}>← Все направления</button><p className="academy-kicker">КУРС · GO BACKEND</p><h1>Что будем делать сегодня?</h1><p>Продолжи программу курса или закрепи тему в практике Go.</p></section>
    <section className="academy-hub-paths container"><button className="hub-course" onClick={() => navigate("/go")}><BookOpen size={30}/><small>ПРОГРАММА КУРСА</small><h2>Go Backend Internship</h2><p>6 модулей · 30 тем · 150 уроков · 3 проекта</p><footer><span>Продолжить курс</span><ArrowRight size={20}/></footer></button><button className="hub-trainer" onClick={() => navigate("/go/practice")}><Code size={30}/><small>ПРАКТИКА ЭТОГО КУРСА</small><h2>Тренажёр Go-задач</h2><p>Слайсы, map, структуры, JSON, HTTP и конкурентность</p><footer><span>Выбрать задачу</span><ArrowRight size={20}/></footer></button></section>
    <section className="academy-hub-status container"><div><p className="academy-kicker">ТВОЙ СТАРТ</p><h2>Настрой рабочее окружение</h2><p>Настрой Go, Git и рабочий репозиторий. После первого push откроется Task Tracker.</p><button onClick={() => navigate("/go/lesson/internship-start/welcome/internship-start-welcome-1")}>Открыть первый урок <ArrowRight size={17}/></button></div><div className="hub-task-list"><small>ПРАКТИКА КУРСА GO</small>{goChallenges.slice(0,3).map((item) => <button onClick={() => navigate(`/go/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{item.title}</b><em>{item.minutes} мин</em><ArrowRight size={16}/></button>)}</div></section>
  </main>;
}

export function GoTrainer({ navigate }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Все");
  const [category, setCategory] = useState("Все");
  const categories = ["Все", ...new Set(goChallenges.map((item) => item.category))];
  const filtered = useMemo(() => goChallenges.filter((item) => (level === "Все" || item.level === level) && (category === "Все" || item.category === category) && item.title.toLowerCase().includes(query.toLowerCase())), [query, level, category]);
  return <main className="go-practice-shell"><nav className="course-context-nav" aria-label="Разделы курса Go"><button onClick={() => navigate("/go")}><ArrowRight size={16}/> Курс Go Backend</button><div><button onClick={() => navigate("/go")}>Программа</button><button className="active" aria-current="page">Практика</button></div></nav><div className="go-trainer container">
    <header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · GO</p><h1>Тренажёр Go-задач</h1><p>Короткие упражнения, которые подготавливают к трём проектам курса.</p></div><div className="trainer-progress-note"><CheckCircle size={20}/><span><b>Начните с малого</b><small>Решённые задачи учитываются в серии дней в профиле.</small></span></div></header>
    <section className="go-trainer-filters" aria-label="Фильтры задач"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}><i className={`level-${item}`}/>{item}{item !== "Все" && <small>{goChallenges.filter((challenge) => challenge.level === item).length}</small>}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск задачи" aria-label="Поиск задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section>
    <section className="go-task-list" aria-live="polite">{filtered.length ? filtered.map((item, index) => <button onClick={() => navigate(`/go/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>) : <div className="trainer-empty"><BracketsCurly size={26}/><b>Подходящих задач пока нет</b><p>Снимите один из фильтров или измените запрос.</p></div>}</section>
    <section className="trainer-project-callout"><Stack size={25}/><div><b>Не знаете, с чего начать?</b><p>Пройдите модуль «Старт стажировки», а затем решите первые три лёгкие задачи.</p></div><button onClick={() => navigate("/go")}>К программе <ArrowRight size={17}/></button></section>
  </div></main>;
}
