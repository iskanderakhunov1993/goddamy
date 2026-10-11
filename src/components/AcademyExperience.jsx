import { useMemo, useState } from "react";
import {
  ArrowRight, BookOpen, BracketsCurly, CheckCircle, Code,
  MagnifyingGlass, ShieldCheck, SlidersHorizontal,
  Stack, FilePy, Database, ChartLineUp, Cube, Play,
} from "@phosphor-icons/react";

const GoLogoTile = () => <span className="tech-logo-tile">Go</span>;
import { courseStats } from "../content/courseCurriculum.js";
import { pythonLessons } from "../content/python/lessons.js";
import { sqlLessons } from "../content/sql/lessons.js";
import { qaLessons } from "../content/qa/lessons.js";
import { lessonsLabel } from "../lib/plural.js";
import { getGoChallenge, goChallenges } from "../content/goChallenges.js";
import "../styles-academy.css";

export { getGoChallenge, goChallenges };

export function PublicGoLanding({ navigate }) {
  const tracks = [
    { title: "Go Backend", status: "Курс доступен", description: "Пройди путь от первой строки до своего приложения Task Tracker с тестами и релизом на GitHub. Ещё два проекта в разработке.", icon: <GoLogoTile/>, level: "Для начинающих", meta: `${lessonsLabel(courseStats.authoredLessons)} · проект`, action: () => navigate("/go") },
    { title: "SQL", status: "Курс доступен", description: "Запросы выполняются прямо в уроке, тренажёр работает на настоящей базе, а в проекте ты пишешь 12 запросов к базе магазина на своём компьютере.", icon: <Database size={20}/>, level: "Для начинающих", meta: `${lessonsLabel(sqlLessons.flatLessons.length)} · проект`, action: () => navigate("/sql") },
    { title: "Python", status: "Курс доступен", description: "Код запускается прямо в уроке и в тренажёре. В проекте ты пишешь приложение для учёта расходов, а скрипт проверяет его 27 тестами.", icon: <FilePy size={20}/>, level: "Для начинающих", meta: `${lessonsLabel(pythonLessons.flatLessons.length)} · проект`, action: () => navigate("/python") },
    { title: "QA", status: "Курс доступен", description: "Тест-дизайн, баг-репорты и автотесты. В проекте ты ищешь восемь багов в модуле магазина, а скрипт проверяет, ловят ли их твои тесты.", icon: <ShieldCheck size={20}/>, level: "Для начинающих", meta: `${lessonsLabel(qaLessons.flatLessons.length)} · проект`, action: () => navigate("/qa") },
    { title: "Кибербезопасность", status: "Курс доступен", description: "Теория с задачами и тренажёр «исправь уязвимость»: пароли, инъекции, сессии, логи. Код выполняется в браузере.", icon: <ShieldCheck size={20}/>, level: "Для начинающих", meta: "Теория и практика", action: () => navigate("/security") },
    { title: "Kubernetes и Kafka", status: "Курс доступен", description: "Теория и тренажёр: манифесты, планировщик, партиции, группы потребителей, гарантии доставки. Проект с настоящим кластером в разработке.", icon: <Cube size={20}/>, level: "Для продолжающих", meta: "Теория и практика", action: () => navigate("/kubernetes") },
    { title: "Python для школьников", status: "Курс доступен", description: "Для 11–16 лет: программирование на реальных задачах — деньги, оценки, словарный диктант, дневник класса. Всё в браузере, без установки.", icon: <FilePy size={20}/>, level: "Для школьников", meta: "Уроки и 11 задач", action: () => navigate("/kids") },
    { title: "YouTube с нуля", status: "Курс доступен", description: "Теория по материалам YouTube и проект: пять опубликованных, полностью оформленных видео на твоём канале.", icon: <Play size={20}/>, level: "Для начинающих", meta: "Теория и проект", action: () => navigate("/youtube") },
    { title: "Product Management", status: "Скоро", description: "Исследование проблемы, метрики и путь продуктовой задачи к релизу.", icon: <ChartLineUp size={20}/>, level: "—", meta: "Программа готовится", action: () => navigate("/product") },
    { title: "Docker", status: "Скоро", description: "Упакуй приложение в контейнер и разверни его в любой среде.", icon: <Cube size={20}/>, level: "—", meta: "Программа готовится" },
  ];
  return <main className="universal-landing">
    <section className="landing-hero container">
      <div className="landing-hero-copy">
        <h1>Осваивай IT‑профессию на практике</h1>
        <p>Короткая теория, тренажёр с настоящей проверкой кода и проект, который ты делаешь на своём компьютере. Курсы и тренажёры бесплатны.</p>
        <div className="landing-hero-actions">
          <button className="landing-primary" onClick={() => navigate("/go")}>Начать с Go <ArrowRight size={20}/></button>
          <button className="landing-link" onClick={() => navigate("/#courses")}>Выбрать другое направление</button>
        </div>
      </div>
      <ol className="landing-steps" aria-label="Как устроено обучение">
        <li><b>Короткая теория</b><span>Только то, что нужно для следующей задачи.</span></li>
        <li><b>Практика с проверкой</b><span>Код запускается, и ты сразу видишь результат.</span></li>
        <li><b>Проект на твоём компьютере</b><span>Скрипт проверяет работу и честно показывает, что готово.</span></li>
      </ol>
    </section>

    <section className="universal-courses container" id="courses">
      <h2>Выбери направление</h2>
      <ul className="universal-course-list">{tracks.map((track) => <li key={track.title}><button disabled={!track.action} onClick={track.action} className={track.action ? "available" : "coming"}>
        <div className="universal-track-icon">{track.icon}</div>
        <div className="universal-track-copy"><small>{track.status}</small><h3>{track.title}</h3><p>{track.description}</p><div className="universal-track-meta"><span>{track.level}</span><span>{track.meta}</span></div></div>
      </button></li>)}</ul>
    </section>

    <section className="universal-subscription container" id="subscription"><div><h2>Учёба бесплатна. Подписка — только за сертификат</h2><p>Уроки, тренажёры и проекты открыты без оплаты. Подписка нужна для одного: скачать сертификат, когда пройдёшь курс целиком.</p><button className="universal-subscription-link" onClick={() => navigate("/certificates")}>Посмотреть сертификаты <ArrowRight size={16}/></button></div><div className="universal-subscription-card"><CheckCircle size={31}/><h3>Что остаётся бесплатным</h3><ul><li>Все уроки</li><li>Тренажёры с проверкой кода</li><li>Проекты и скрипты их проверки</li></ul><button onClick={() => navigate("/subscription")}>Что даёт подписка <ArrowRight size={18}/></button><small>Подписка открывает только скачивание сертификата</small></div></section>
  </main>;
}

export function AcademyHub({ navigate }) {
  return <main className="academy-hub">
    <section className="academy-hub-hero container"><button className="academy-hub-back" onClick={() => navigate("/")}>← Все направления</button><p className="academy-kicker">КУРС · GO BACKEND</p><h1>Что будем делать сегодня?</h1><p>Продолжи программу курса или закрепи тему в практике Go.</p></section>
    <section className="academy-hub-paths container"><button className="hub-course" onClick={() => navigate("/go")}><BookOpen size={30}/><small>ПРОГРАММА КУРСА</small><h2>Go Backend</h2><p>{lessonsLabel(courseStats.authoredLessons)} · проект Task Tracker · ещё {courseStats.modules - courseStats.readyModules} модуля в разработке</p><footer><span>Продолжить курс</span><ArrowRight size={20}/></footer></button><button className="hub-trainer" onClick={() => navigate("/go/practice")}><Code size={30}/><small>ПРАКТИКА ЭТОГО КУРСА</small><h2>Тренажёр Go-задач</h2><p>Слайсы, map, структуры, JSON, HTTP и конкурентность</p><footer><span>Выбрать задачу</span><ArrowRight size={20}/></footer></button></section>
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
    <header className="go-trainer-header"><div><p className="academy-kicker">ПРАКТИКА · GO</p><h1>Тренажёр Go-задач</h1><p>Короткие упражнения, которые готовят к проекту курса.</p></div><div className="trainer-progress-note"><CheckCircle size={20}/><span><b>Начни с малого</b><small>Решённые задачи учитываются в серии дней в профиле.</small></span></div></header>
    <section className="go-trainer-filters" aria-label="Фильтры задач"><div className="trainer-filter-row"><div className="trainer-levels">{["Все", "Лёгкая", "Средняя", "Сложная"].map((item) => <button className={level === item ? "active" : ""} onClick={() => setLevel(item)} key={item}><i className={`level-${item}`}/>{item}{item !== "Все" && <small>{goChallenges.filter((challenge) => challenge.level === item).length}</small>}</button>)}</div><label><MagnifyingGlass size={18}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск задачи" aria-label="Поиск задачи"/></label></div><div className="trainer-categories"><SlidersHorizontal size={17}/>{categories.map((item) => <button onClick={() => setCategory(item)} className={category === item ? "active" : ""} key={item}>{item}</button>)}</div></section>
    <section className="go-task-list" aria-live="polite">{filtered.length ? filtered.map((item, index) => <button onClick={() => navigate(`/go/practice/${item.id}`)} key={item.id}><span className={`academy-dot level-${item.level}`}/><b>{String(index + 1).padStart(2, "0")}. {item.title}</b><em>{item.category}</em><small>{item.level} · {item.minutes} мин</small><ArrowRight size={18}/></button>) : <div className="trainer-empty"><BracketsCurly size={26}/><b>Подходящих задач пока нет</b><p>Сними один из фильтров или измени запрос.</p></div>}</section>
    <section className="trainer-project-callout"><Stack size={25}/><div><b>Не знаешь, с чего начать?</b><p>Пройди модуль «Старт», а затем реши первые три лёгкие задачи.</p></div><button onClick={() => navigate("/go")}>К программе <ArrowRight size={17}/></button></section>
  </div></main>;
}
