import { useState } from "react";
import "../styles-dashboard.css";
import "../styles-lesson-blocks.css";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, Circle, Code,
  GithubLogo, Lightbulb, RocketLaunch, Target, BookOpen, House,
  List, X, CaretRight, UserCircle, PencilSimple, Trophy, Flame,
  Certificate, Briefcase, GitBranch, CalendarBlank, LinkSimple, MapPin, LockSimple, Cube
} from "@phosphor-icons/react";
import { project, setupTasks, sprints, stages, storyBeats } from "../content/goCourse.js";
import { courseCurriculum } from "../content/courseCurriculum.js";
import { courseLessonPath, findLesson, flattenCourse, loadCourseDraft } from "../content/courseDraft.js";
import { LessonBlocks } from "./LessonBlocks.jsx";
import { getActivitySummary } from "../lib/activity.js";
import "../styles-profile.css";

const weekdayLabels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function ProgressBar({ value, label = "Общий прогресс" }) {
  return <div className="learning-progress" aria-label={`${label}: ${value}%`}>
    <div><span>{label}</span><b>{value}%</b></div>
    <i><span style={{ width: `${value}%` }} /></i>
  </div>;
}

export function LearningLayout({ current, navigate, children }) {
  const activeIndex = stages.findIndex((stage) => stage.id === current);
  return <div className="learning-layout">
    <aside className="stage-sidebar" aria-label="Этапы проекта">
      <button className="stage-course-link" onClick={() => navigate("/go")}><ArrowLeft size={16}/> К курсу</button>
      <small>ПРОЕКТ 1</small>
      <h2>Task Tracker</h2>
      <nav>{stages.map((stage) =>
        <button
          key={stage.id}
          className={stage.id === current ? "active" : ""}
          aria-current={stage.id === current ? "page" : undefined}
          onClick={() => navigate(stage.path)}
        >
          <Circle size={18} weight={stage.id === current ? "fill" : "regular"}/>
          <span>{stage.title}</span>
        </button>
      )}</nav>
    </aside>
    <div className="mobile-stage-nav">
      <span>{activeIndex + 1} / {stages.length}</span>
      <select aria-label="Текущий этап" value={current} onChange={(event) => navigate(stages.find((stage) => stage.id === event.target.value).path)}>
        {stages.map((stage) => <option value={stage.id} key={stage.id}>{stage.title}</option>)}
      </select>
    </div>
    <main className="learning-main">{children}</main>
  </div>;
}

function PageNavigation({ current, navigate }) {
  const index = stages.findIndex((stage) => stage.id === current);
  const previous = stages[index - 1];
  const next = stages[index + 1];
  return <nav className="page-navigation" aria-label="Навигация между этапами">
    {previous ? <button onClick={() => navigate(previous.path)}><ArrowLeft size={17}/><span><small>Назад</small>{previous.title}</span></button> : <span/>}
    {next ? <button className="next" onClick={() => navigate(next.path)}><span><small>Следующий этап</small>{next.title}</span><ArrowRight size={17}/></button> : <button className="next" onClick={() => navigate("/go")}><span><small>Завершить</small>К программе</span><ArrowRight size={17}/></button>}
  </nav>;
}

function Checklist({ items, title = "Чек-лист" }) {
  const [checked, setChecked] = useState([]);
  const toggle = (id) => setChecked((state) => state.includes(id) ? state.filter((item) => item !== id) : [...state, id]);
  return <section className="interactive-checklist">
    <div className="checklist-heading"><h2>{title}</h2><span>{checked.length} из {items.length}</span></div>
    <ProgressBar value={Math.round((checked.length / items.length) * 100)} label="Выполнено"/>
    <div>{items.map((item, index) => {
      const normalized = typeof item === "string" ? { id: String(index), title: item } : item;
      const done = checked.includes(normalized.id);
      return <article className={done ? "done" : ""} key={normalized.id}>
        <button aria-pressed={done} onClick={() => toggle(normalized.id)}>
          {done ? <Check size={16} weight="bold"/> : <Circle size={18}/>}
          <span>{normalized.title}</span>
        </button>
        {normalized.explanation && <details>
          <summary>Инструкция и проверка</summary>
          <p>{normalized.explanation}</p>
          {normalized.command && <pre><code>{normalized.command}</code></pre>}
          <dl><div><dt>Как проверить</dt><dd>{normalized.verification}</dd></div><div><dt>Типичная ошибка</dt><dd>{normalized.commonError}</dd></div></dl>
        </details>}
      </article>;
    })}</div>
  </section>;
}

const createDashboardStages = (course) => course.map((courseModule, index) => ({
  id: courseModule.id,
  title: courseModule.title,
  meta: `${courseModule.phase || "МОДУЛЬ"} · ${courseModule.topics.length} тем · ${courseModule.topics.reduce((total, courseTopic) => total + courseTopic.lessons.length, 0)} уроков`,
  state: index < 2 ? "active" : "locked",
}));

function CourseOutline({ course = courseCurriculum, initialSectionId = null, onClose, navigate }) {
  const [selection, setSelection] = useState({ section: initialSectionId || null, topic: null });
  const section = course.find((item) => item.id === selection.section);
  const topic = section?.topics.find((item) => item.id === selection.topic);
  const goBack = () => setSelection((state) => state.topic !== null ? { ...state, topic: null } : { section: null, topic: null });
  const title = topic?.title || section?.title || "Основы Go";
  const items = topic?.lessons || section?.topics || course;
  const isLessonView = Boolean(topic);
  return <div className="course-modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-outline-title" onMouseDown={(event) => event.stopPropagation()}>
      <button className="modal-close" onClick={onClose} aria-label="Закрыть программу"><X size={26}/></button>
      <div className="modal-crumb"><span>Курс</span>{section && <><CaretRight size={14}/><span>{topic ? "Тема" : "Раздел"}</span></>}</div>
      {section && <button className="outline-back" onClick={goBack}><ArrowLeft size={15}/> Назад к {topic ? "темам" : "курсу"}</button>}
      <h2 id="course-outline-title">{title}</h2>
      <p>{isLessonView ? "Уроки" : section ? "Темы курса" : "Разделы курса"}</p>
      <div className="outline-list">
        {items.map((item, index) => {
          const label = item.title;
          const complete = index === 0;
          return <button key={label} onClick={() => {
            if (isLessonView) { onClose(); navigate(courseLessonPath({ ...item, section, topic })); }
            else if (section) setSelection((state) => ({ ...state, topic: item.id }));
            else setSelection({ section: item.id, topic: null });
          }}>
            <span>{String(index + 1).padStart(2, "0")}</span><b>{label}</b>{complete ? <Check size={17}/> : <Circle size={17}/>}<CaretRight size={17}/>
          </button>;
        })}
      </div>
    </section>
  </div>;
}

export function CoursePage({ navigate }) {
  const [course] = useState(loadCourseDraft);
  const dashboardStages = createDashboardStages(course);
  const courseLessons = flattenCourse(course);
  const topicCount = course.reduce((sum, item) => sum + item.topics.length, 0);
  const [outlineSection, setOutlineSection] = useState(null);
  const closeOutline = () => setOutlineSection(null);
  const [activity] = useState(getActivitySummary);
  return <main className="course-dashboard">
    <aside className="dashboard-rail" aria-label="Навигация кабинета"><button className="dashboard-logo" onClick={() => navigate("/")}><span>GO</span>DEMY</button><nav><button aria-label="Главная" onClick={() => navigate("/")}><House size={20}/></button><button className="active" aria-label="Мой курс" onClick={() => navigate("/go")}><BookOpen size={20}/></button><button aria-label="Практика курса Go" onClick={() => navigate("/go/practice")}><Code size={20}/></button><button aria-label="Программа курса" onClick={() => setOutlineSection("root")}><List size={20}/></button><button aria-label="Редактор курса" onClick={() => navigate("/course-editor")}><PencilSimple size={20}/></button></nav><button aria-label="Профиль" onClick={() => navigate("/profile")}><UserCircle size={21}/></button></aside>
    <div className="dashboard-content">
      <section className="course-hero">
        <div className="course-hero-copy">
          <small>СТАЖИРОВКА · BIT TECH</small>
          <h1>Go Backend Internship</h1>
          <p>Три проверяемых проекта: от первого commit до backend-сервиса в Docker.</p>
          <div className="course-hero-actions">
            <button className="btn-primary" disabled={!courseLessons.length} onClick={() => courseLessons[0] && navigate(courseLessonPath(courseLessons[0]))}>Начать стажировку <ArrowRight size={18}/></button>
            <button className="btn-ghost" onClick={() => navigate("/go/practice")}><Code size={17}/> Практика Go</button>
          </div>
        </div>
        <div className="course-includes">
          <b>Курс включает</b>
          <ul>
            <li><BookOpen size={16}/> {courseLessons.length} уроков · {topicCount} тем</li>
            <li><Cube size={16}/> 3 проверяемых проекта</li>
            <li><Certificate size={16}/> Сертификат по итогам</li>
          </ul>
        </div>
      </section>
      <div className="course-prog"><span className="course-prog-pill">0%</span><div className="course-prog-track"><span style={{ width: "0%" }}/></div><span className="course-prog-label">0 / {courseLessons.length} уроков</span></div>
      <section className="dashboard-goal"><div className="goal-icon"><Flame size={20}/></div><div><b>{activity.currentStreak > 0 ? `Сейчас у тебя ${activity.currentStreak} ${activity.currentStreak === 1 ? "день" : activity.currentStreak < 5 ? "дня" : "дней"} практики подряд` : "Рабочий ритм: выбери 2 учебных вечера в неделю"}</b><p>Стрики мягкие: пауза не обнуляет прогресс, а Рома помогает вернуться с малого шага.</p></div><button onClick={() => navigate("/profile")}>Открыть кабинет</button></section>
      <section className="dashboard-program">
        <h2 className="course-syllabus-heading">Программа курса</h2>
        <div className="course-syllabus">{dashboardStages.map((stage, index) => <button className="syllabus-mod" key={stage.id} onClick={() => setOutlineSection(stage.id)}><span className={`syllabus-num ${stage.state === "locked" ? "lock" : ""}`}>{index + 1}</span><div><b>{stage.title}</b><small>{stage.meta}</small></div></button>)}</div>
      </section>
    </div>
    {outlineSection && <CourseOutline course={course} initialSectionId={outlineSection === "root" ? null : outlineSection} onClose={closeOutline} navigate={navigate}/>}
  </main>;
}

export function ProfilePage({ navigate }) {
  const [course] = useState(loadCourseDraft);
  const lessonCount = flattenCourse(course).length;
  const completedLessons = 0;
  const percent = lessonCount ? Math.round((completedLessons / lessonCount) * 100) : 0;
  const hasSubscription = false;
  const courseComplete = percent >= 100;
  const certReady = courseComplete && hasSubscription;
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({ name: "Стажёр Bit Tech", about: "Учусь собирать backend-сервисы на Go через реальные задачи команды.", city: "Москва, Россия", github: "" });
  const changeProfile = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const [activity] = useState(getActivitySummary);
  return <main className="profile-shell">
    <div className="profile-content">
      <div className="profile-header"><div><small>BIT TECH · ЛИЧНЫЙ КАБИНЕТ</small><h1>Профиль стажёра</h1><p>Прогресс, портфолио и подтверждения твоей практики.</p></div></div>
      <div className="profile-layout">
        <aside className="profile-card"><img src="/characters/avatar-protagonist-neutral-v1.png" alt="Аватар стажёра"/><div><small>PRE-JUNIOR · BIT TECH</small><h2>{profile.name}</h2></div><button className="profile-edit" onClick={() => setEditing((value) => !value)}><PencilSimple size={16}/>{editing ? "Готово" : "Редактировать профиль"}</button><p className="profile-joined"><CalendarBlank size={16}/> В программе с августа 2026</p>{editing ? <form onSubmit={(event) => { event.preventDefault(); setEditing(false); }}><label>Имя<input value={profile.name} onChange={(event) => changeProfile("name", event.target.value)} maxLength={40}/></label><label>О себе<textarea value={profile.about} onChange={(event) => changeProfile("about", event.target.value)} maxLength={280}/></label><label>Город<input value={profile.city} onChange={(event) => changeProfile("city", event.target.value)} maxLength={60}/></label><label>GitHub<input value={profile.github} onChange={(event) => changeProfile("github", event.target.value)} placeholder="https://github.com/username"/></label><button className="profile-save">Сохранить</button></form> : <><p className="profile-about">{profile.about}</p><p className="profile-location"><MapPin size={16}/>{profile.city}</p>{profile.github && <a href={profile.github} target="_blank" rel="noreferrer"><LinkSimple size={16}/> GitHub</a>}</>}<div className="profile-level"><b>Intern <ArrowRight size={15}/> Junior</b><i><span style={{ width: "0%" }}/></i><small>0 / 100 XP · рост через выполненные задачи</small></div></aside>
        <div className="profile-main">
          <section className="profile-progress">
            <div className="profile-panel-heading"><div><h2>Прогресс по обучению</h2><p>Начни онбординг — первый урок откроет рабочий ритм.</p></div><button onClick={() => navigate("/go")}>К программе <ArrowRight size={16}/></button></div>
            <div className="progress-course">
              <div className="progress-course-top"><b>Go Backend Internship</b><span>{completedLessons} / {lessonCount} уроков</span></div>
              <div className="progress-course-bar"><i style={{ width: `${percent}%` }}/></div>
              <span className="progress-course-percent">{percent}%</span>
            </div>
            <div className={certReady ? "cert-unlock ready" : "cert-unlock"}>
              {certReady ? <Certificate size={19}/> : <LockSimple size={19}/>}
              <div><b>Сертификат курса</b><p>{courseComplete ? "Курс пройден. Оформите подписку, чтобы скачать сертификат." : "Откроется после 100% курса и активной подписки."}</p></div>
              <button disabled={!certReady} onClick={() => certReady && navigate("/certificates")}>Скачать сертификат</button>
            </div>
            <div className="profile-stats"><div><Flame size={25}/><span><b>{activity.currentStreak}</b><small>Текущая серия · дней подряд</small></span></div><div><Trophy size={25}/><span><b>{activity.bestStreak}</b><small>Личный рекорд</small></span></div><div><GitBranch size={25}/><span><b>0 / 3</b><small>Проверено проектов</small></span></div></div>
            <div className="profile-week"><b>Последние 7 дней</b><div>{activity.last7Days.map((day, index) => <span key={day.key} className={day.active ? "active" : day.isFuture ? "future" : ""}><Flame size={20} weight={day.active ? "fill" : "regular"}/><small>{weekdayLabels[index]}</small></span>)}</div></div>
          </section>
          <section className="profile-progress">
            <div className="profile-panel-heading"><div><h2>Достижения (0 / 6)</h2><p>Открываются по мере прохождения курса.</p></div></div>
            <div className="badge-grid">
              <div><GithubLogo size={18}/><span><b>Первый commit</b><small>Первое изменение в Git</small></span></div>
              <div><Code size={18}/><span><b>Чистая сборка</b><small>go build и go vet без ошибок</small></span></div>
              <div><CheckCircle size={18}/><span><b>Защитник тестов</b><small>Логика покрыта тестами</small></span></div>
              <div><Cube size={18}/><span><b>Три проекта</b><small>Все три проекта сданы</small></span></div>
              <div><Target size={18}/><span><b>Ревью пройдено</b><small>Код прошёл проверку</small></span></div>
              <div><Certificate size={18}/><span><b>Сертификат</b><small>Курс завершён на 100%</small></span></div>
            </div>
          </section>
          <section className="profile-activity"><div className="profile-panel-heading"><div><h2>Активность за 12 месяцев</h2><p>Мягкий ритм: пропуск не обнуляет историю практики, только текущую серию.</p></div><span>Всего дней практики: {activity.totalDays}</span></div><div className="activity-grid">{activity.weeks.map((week) => <i key={week.key} className={week.active ? "active" : ""} aria-label={week.active ? "Была практика на этой неделе" : "Нет активности"}/>)}</div></section>
        </div>
      </div>
    </div>
  </main>;
}

export function CertificatesPage({ navigate }) {
  const certificates = [
    { title: "Go Junior Developer", status: "В процессе", progress: "0 из 6 модулей", description: "Подтверждает прохождение курса Go Backend: три проекта, тесты, GitHub-артефакты и финальная ретроспектива.", action: "Открыть курс", path: "/go" },
    { title: "Python Junior Developer", status: "В процессе", progress: "0 из 6 модулей", description: "Подтверждает владение Python, коллекциями, файлами, классами, тестами и выполнение итогового проекта.", action: "Открыть курс", path: "/python" },
    { title: "SQL Junior Developer", status: "В процессе", progress: "0 из 6 модулей", description: "Подтверждает умение получать, объединять и анализировать данные, а также решать прикладные задачи с помощью SQL.", action: "Открыть курс", path: "/sql" },
    { title: "Agile", status: "Скоро", progress: "Курс готовится", description: "Подтвердит понимание итеративной разработки, работы с ценностью, обратной связью и изменениями.", action: "Программа скоро", path: null },
    { title: "Scrum", status: "Скоро", progress: "Курс готовится", description: "Подтвердит понимание ролей, событий и артефактов Scrum через симуляцию командных спринтов.", action: "Программа скоро", path: null },
  ];
  return <main className="certificates-shell"><section className="certificates-content"><div className="certificates-header"><small>GODEMY · ДОСТИЖЕНИЯ</small><h1>Сертификаты за курсы</h1><p>Сертификат выдаётся после завершения полноценного курса и итоговой проверки. Тренажёры и отдельные проекты помогают учиться, но не создают отдельный сертификат.</p></div><div className="certificate-grid">{certificates.map((item) => <article key={item.title}><div className="certificate-lock"><Certificate size={26}/><span>{item.status}</span></div><h2>{item.title}</h2><p>{item.description}</p><div className="certificate-progress"><b>{item.progress}</b><i><span style={{ width: "0%" }}/></i></div><button disabled={!item.path} onClick={() => item.path && navigate(item.path)}>{item.action} {item.path && <ArrowRight size={17}/>}</button></article>)}</div><section className="certificate-how"><h2>Как получить сертификат</h2><ol><li>Заверши обязательные модули и практические задания курса.</li><li>Выполни итоговую работу и пройди проверку по критериям.</li><li>После подтверждения результата сертификат появится в профиле.</li></ol><button onClick={() => navigate("/profile")}>К профилю <ArrowLeft size={17}/></button></section></section></main>;
}

export function SubscriptionPage({ navigate }) {
  const [period, setPeriod] = useState("month");
  const price = period === "month" ? "1 990 ₽" : "1 250 ₽";
  const periodLabel = period === "month" ? "Ежемесячно" : "Ежегодно (−37%)";
  const [confirmed, setConfirmed] = useState(false);
  return <main className="profile-shell"><div className="profile-content checkout-content">
    <div className="profile-header"><div><small>GODEMY · ПОДПИСКА</small><h1>Один тариф, полный доступ ко всем курсам</h1></div></div>
    <div className="checkout-grid">
      <div className="plan-box">
        <div className="checkout-toggle">
          <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>Ежемесячно</button>
          <button className={period === "year" ? "active" : ""} onClick={() => setPeriod("year")}>Ежегодно −37%</button>
        </div>
        <div className="checkout-price"><b>{price}</b><span>/ месяц</span></div>
        <ul className="checkout-features">
          <li><Check size={17}/> Все практические IT-курсы</li>
          <li><Check size={17}/> Тренажёр с проверкой в каждом курсе</li>
          <li><Check size={17}/> Проверяемые сертификаты</li>
        </ul>
      </div>
      <div className="summary-box">
        <div className="summary-row"><span>Godemy Unlimited</span><span>{price}</span></div>
        <div className="summary-row"><span>Период</span><span>{periodLabel}</span></div>
        <div className="summary-total"><span>Сегодня</span><span>{price}</span></div>
        {confirmed
          ? <p className="checkout-confirm">Подписка активирована. Сертификаты откроются после 100% прохождения курса.</p>
          : <button className="btn-primary checkout-submit" onClick={() => setConfirmed(true)}>Оформить подписку</button>}
        <small className="checkout-disclaimer">Демо-режим: оплата не списывается, это учебный проект.</small>
      </div>
    </div>
  </div></main>;
}

export function StoryLesson({ sectionId = "intro", topicId = "welcome", lessonId = "welcome", navigate }) {
  const [course] = useState(loadCourseDraft);
  const flatLessons = flattenCourse(course);
  const current = findLesson(course, sectionId, topicId, lessonId);
  const currentIndex = flatLessons.findIndex((item) => item.section.id === current.section.id && item.topic.id === current.topic.id && item.id === current.id);
  const previous = flatLessons[currentIndex - 1];
  const next = flatLessons[currentIndex + 1];
  const lessonIndex = current.topic.lessons.findIndex((item) => item.id === current.id);
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const toggle = (item) => setSelected((items) => items.includes(item) ? items.filter((value) => value !== item) : [...items, item]);
  const objectives = current.objectives?.length ? current.objectives : ["Понять основную идею урока", "Связать её с задачей проекта", "Проверить себя на небольшом примере"];
  const lessonBlocks = Array.isArray(current.blocks) ? current.blocks : [];
  const choices = ["Основная идея понятна", "Могу объяснить её своими словами", "Готов применить подход в проекте"];
  const openLesson = (item) => navigate(item ? courseLessonPath(item) : "/go/task-tracker");

  return <main className="story-lesson-shell">
    <aside className="story-side">
      <button onClick={() => navigate("/go")} aria-label="К программе"><ArrowLeft size={20}/></button>
      <button onClick={() => navigate("/")} aria-label="На главную"><House size={20}/></button>
      <button onClick={() => navigate("/go")} aria-label="Мой курс"><BookOpen size={20}/></button>
    </aside>
    <article className="story-lesson lesson-reader">
      <header>
        <div>{current.section.title} <span/> {current.topic.title} · Урок {lessonIndex + 1}/{current.topic.lessons.length}</div>
        <i>{current.topic.lessons.map((item, index) => <b className={index <= lessonIndex ? "complete" : ""} key={item.id}/>)}</i>
      </header>
      <h1>{current.title}</h1>
      <p className="story-lead">{current.summary}</p>

      {lessonBlocks.length > 0 && <LessonBlocks blocks={lessonBlocks}/>}

      {lessonBlocks.length === 0 && <><section className="lesson-copy">
        <h2>Зачем это нужно в работе</h2>
        <p>В Bit Tech знания не существуют отдельно от задачи. Материал этого урока понадобится, чтобы сделать следующий небольшой шаг в Task Tracker и объяснить своё решение команде.</p>
        <p>Сначала разберите принцип на нейтральном примере. Затем перенесите подход в проект самостоятельно — готового решения задачи здесь нет.</p>
        <h2>После урока вы сможете:</h2>
        <ul>{objectives.map((goal) => <li key={goal}>{goal};</li>)}</ul>
      </section>

      <div className="chat-thread lesson-dialogue">
        <div className="chat-message learner"><div><small>Вы · стажёр</small><p>Как понять, что я действительно разобрался в теме?</p></div></div>
        <div className="chat-message teammate"><div><small>Рома · team lead</small><p>Попробуй объяснить принцип без терминов и применить его в другом примере. Если оба шага получились — можно идти дальше.</p></div></div>
      </div>

      <section className="lesson-copy lesson-example">
        <small>ПОХОЖИЙ ПРИМЕР</small>
        <h2>Каталог оборудования</h2>
        <p>Представьте небольшой внутренний каталог Bit Tech. Возьмите принцип из урока и примените его к данным об оборудовании: название, состояние и ответственный сотрудник.</p>
        <p>Не копируйте предметную область в Task Tracker. Важно увидеть общий способ рассуждения и самостоятельно перенести его на задачи.</p>
      </section></>}

      <section className="story-task lesson-checkpoint">
        <small>САМОПРОВЕРКА</small>
        <h2>Можно переходить дальше?</h2>
        <p>Отметьте только то, что уже можете сделать.</p>
        {choices.map((choice) => <label key={choice}><input type="checkbox" checked={selected.includes(choice)} onChange={() => toggle(choice)}/><span><Check size={15}/></span>{choice}</label>)}
        <button className="primary" disabled={selected.length !== choices.length} onClick={() => setSubmitted(true)}>{submitted ? "Урок завершён" : "Завершить урок"} <Check size={17}/></button>
        {submitted && <p className="story-success">Прогресс отмечен. Следующий урок уже доступен.</p>}
      </section>
      <footer className="lesson-footer">
        <button className="lesson-feedback">Полезно</button><button className="lesson-feedback">Непонятно</button>
        <div className="lesson-pager">{previous && <button onClick={() => openLesson(previous)}><ArrowLeft size={17}/> Назад</button>}<button className="story-next" onClick={() => openLesson(next)}>{next ? "К следующему уроку" : "К проекту"} <ArrowRight size={17}/></button></div>
      </footer>
    </article>
  </main>;
}

export function ProjectPage({ navigate }) {
  return <LearningLayout current="project" navigate={navigate}>
    <article className="learning-article">
      <header className="learning-header"><small>ПРОЕКТ 1 · 4 СПРИНТА</small><h1>{project.title}</h1><p>{project.description}</p><button className="primary" onClick={() => navigate("/go/task-tracker/setup")}>Начать подготовку <ArrowRight size={17}/></button></header>
      <StoryMessage story={storyBeats.project}/>
      <section className="situation-grid"><div><Target size={24}/><small>РАБОЧАЯ СИТУАЦИЯ</small><h2>{project.situation}</h2></div><div><Lightbulb size={24}/><small>ПРОБЛЕМА</small><p>{project.problem}</p></div></section>
      <section><h2>Что вы создадите</h2><div className="requirements-grid">{project.requirements.map((item) => <span key={item}><CheckCircle size={18}/>{item}</span>)}</div></section>
      <section className="scope-grid"><div><h3>Входит в проект</h3><div className="tag-list">{project.stack.map((item) => <span key={item}>{item}</span>)}</div></div><div><h3>Не входит</h3><ul>{project.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      <section><h2>Маршрут из четырёх спринтов</h2><div className="sprint-overview">{sprints.map((sprint) => <button key={sprint.number} onClick={() => navigate(`/go/task-tracker/sprint/${sprint.number}`)}><span>0{sprint.number}</span><b>{sprint.title}</b><small>{sprint.result}</small><ArrowRight size={17}/></button>)}</div></section>
      <section className="completion-panel"><div><RocketLaunch size={27}/><h2>Готовый результат</h2><p>{project.result}</p></div><div><h3>Критерии завершения</h3>{project.completionCriteria.map((item) => <p key={item}><Check size={15}/>{item}</p>)}</div><div><h3>Артефакты GitHub</h3>{project.artifacts.map((item) => <p key={item}><GithubLogo size={15}/>{item}</p>)}</div></section>
      <PageNavigation current="project" navigate={navigate}/>
    </article>
  </LearningLayout>;
}

export function SetupPage({ navigate }) {
  return <LearningLayout current="setup" navigate={navigate}>
    <article className="learning-article">
      <header className="learning-header"><small>ПОДГОТОВИТЕЛЬНЫЙ ЭТАП</small><h1>Настройте рабочее окружение</h1><p>Пройдите шаги по порядку. Раскрывайте инструкции, выполняйте команды и отмечайте только реально проверенные пункты.</p></header>
      <StoryMessage story={storyBeats.setup}/>
      <Checklist items={setupTasks} title="12 шагов до первого push"/>
      <PageNavigation current="setup" navigate={navigate}/>
    </article>
  </LearningLayout>;
}

function ContentBlock({ eyebrow, title, children, icon = null }) {
  return <section className="content-block">{icon}<small>{eyebrow}</small><h2>{title}</h2>{children}</section>;
}

function StoryMessage({ story }) {
  return <aside className="story-message" aria-label={`${story.name}: ${story.label}`}>
    <div>
      <small>{story.label}</small>
      <div className="story-person"><b>{story.name}</b><span>{story.role}</span></div>
      <p>{story.message}</p>
    </div>
  </aside>;
}

export function SprintPage({ number, navigate }) {
  const sprint = sprints.find((item) => item.number === number) || sprints[0];
  const current = `sprint-${sprint.number}`;
  const [hint, setHint] = useState(null);
  return <LearningLayout current={current} navigate={navigate}>
    <article className="learning-article sprint-page">
      <header className="learning-header"><small>СПРИНТ {sprint.number} ИЗ 4</small><h1>{sprint.title}</h1><p>{sprint.situation}</p><div className="sprint-goal"><Target size={21}/><span><small>ЦЕЛЬ</small><b>{sprint.goal}</b></span></div></header>
      <StoryMessage story={sprint.story}/>
      <ContentBlock eyebrow="РЕЗУЛЬТАТ" title="Что получится в конце"><p>{sprint.result}</p><div className="knowledge-list">{sprint.knowledge.map((item) => <span key={item}>{item}</span>)}</div></ContentBlock>
      <ContentBlock eyebrow="КОРОТКАЯ ТЕОРИЯ" title="Только то, что нужно для задачи" icon={<Code size={24}/>}><p>{sprint.theory}</p></ContentBlock>
      <ContentBlock eyebrow="ПОХОЖИЙ ПРИМЕР" title={sprint.exampleTitle}><p>{sprint.example}</p><div className="example-note"><Lightbulb size={18}/><span>Перенесите принцип, но не предметную область. Готового решения Task Tracker здесь нет.</span></div></ContentBlock>
      <Checklist items={sprint.tasks} title="Самостоятельные задачи"/>
      <ContentBlock eyebrow="ПРИЁМКА" title="Критерии готовности"><div className="criteria-list">{sprint.criteria.map((item) => <p key={item}><Circle size={17}/>{item}</p>)}</div></ContentBlock>
      <ContentBlock eyebrow="ПОДСКАЗКИ" title="Открывайте только когда застряли"><div className="hint-list">{sprint.hints.map((item, index) => <button key={item} onClick={() => setHint(hint === index ? null : index)}><span>Подсказка {index + 1}</span><b>{hint === index ? item : "Показать"}</b></button>)}</div></ContentBlock>
      <ContentBlock eyebrow="САМОПРОВЕРКА" title="Объясните себе"><Checklist items={sprint.selfCheck}/></ContentBlock>
      <ContentBlock eyebrow="GITHUB-ПРОЦЕСС" title="Доведите работу до репозитория" icon={<GithubLogo size={24}/>}><ol className="github-steps">{sprint.github.map((item) => <li key={item}>{item}</li>)}</ol></ContentBlock>
      <section className="sprint-finish"><CheckCircle size={28}/><div><h2>Завершение спринта</h2><p>Отметьте обязательные задачи, проверьте критерии и только после этого переходите дальше.</p></div><button className="primary" onClick={() => navigate(stages[stages.findIndex((stage) => stage.id === current) + 1].path)}>Следующий этап <ArrowRight size={17}/></button></section>
      <PageNavigation current={current} navigate={navigate}/>
    </article>
  </LearningLayout>;
}

export function RetrospectivePage({ navigate }) {
  const questions = ["Что вы создали?", "Что получилось лучше всего?", "Где возникли сложности?", "Какие темы нужно повторить?", "Что сделаете иначе в следующем проекте?"];
  return <LearningLayout current="retrospective" navigate={navigate}>
    <article className="learning-article">
      <header className="learning-header"><small>ФИНАЛ ПРОЕКТА</small><h1>Ретроспектива</h1><p>Зафиксируйте результат и превратите опыт разработки в понятные выводы.</p></header>
      <StoryMessage story={storyBeats.retrospective}/>
      <form className="retrospective-form" onSubmit={(event) => event.preventDefault()}>
        {questions.map((question) => <label key={question}><span>{question}</span><textarea rows={3} placeholder="Ваш ответ"/></label>)}
        <label><span>Ссылка на GitHub-репозиторий</span><input type="url" placeholder="https://github.com/username/task-tracker"/></label>
        <label><span>Ссылка на GitHub release</span><input type="url" placeholder="https://github.com/username/task-tracker/releases/tag/v1.0.0"/></label>
        <p className="form-notice">Сохранение прогресса и завершение проекта появятся после подключения выбранного хранилища.</p>
        <button className="primary" type="submit" disabled>Сохранение пока недоступно</button>
      </form>
      <PageNavigation current="retrospective" navigate={navigate}/>
    </article>
  </LearningLayout>;
}
