import { useState } from "react";
import { lessonsLabel, modulesLabel, topicsLabel } from "../lib/plural.js";
import { getCompletedLessonIds } from "../lib/progress.js";
import {
  ArrowRight, ArrowsClockwise, ArrowsDownUp, BookOpen, BracketsCurly,
  Briefcase, ChartBar, ChartLineUp, CheckCircle, Code, Cube, Database, FileCode,
  Funnel, Function, GitBranch, House, List, ListBullets,
  PresentationChart, RocketLaunch, ShareNetwork, ShieldCheck,
  Table, TerminalWindow, UserCircle, X,
} from "@phosphor-icons/react";

const artworkSets = {
  go: [TerminalWindow, BracketsCurly, ListBullets, Database, ShareNetwork, RocketLaunch],
  sql: [Table, Funnel, ArrowsDownUp, ChartBar, GitBranch, PresentationChart],
  python: [Function, ArrowsClockwise, ListBullets, FileCode, Cube, ChartLineUp],
  product: [Briefcase, UserCircle, ChartLineUp, Funnel, ListBullets, RocketLaunch],
  qa: [CheckCircle, ListBullets, FileCode, BracketsCurly, ShieldCheck, RocketLaunch],
};

export function ModuleArtwork({ course = "go", index = 0, number = null }) {
  const Primary = (artworkSets[course] || artworkSets.go)[index % 6];
  return <div className="stage-art module-art" aria-hidden="true"><Primary className="module-art-primary" size={44} weight="regular"/><span>{number || String(index + 1).padStart(2, "0")}</span></div>;
}

export function ModuleGlyph({ course = "go", index = 0 }) {
  const Icon = (artworkSets[course] || artworkSets.go)[index % 6];
  return <Icon className="go-module-icon" size={58} weight="light" aria-hidden="true"/>;
}

function CourseLessons({ lessons, navigate }) {
  const completed = new Set(getCompletedLessonIds(lessons.slug));
  const done = lessons.flatLessons.filter((lesson) => completed.has(lesson.id)).length;
  return <section className="cabinet-lessons">
    <header><h2>Уроки</h2><span>{done} / {lessons.flatLessons.length} пройдено</span></header>
    {lessons.curriculum.map((module) => <div className="cabinet-lessons-module" key={module.id}>
      <h3>{module.title}</h3>
      <p>{module.summary}</p>
      <ol>{module.topics.flatMap((topic) => topic.lessons.map((lesson) => <li key={lesson.id}>
        <button onClick={() => navigate(lessons.lessonPath({ ...lesson, topic, section: module }))}>
          {completed.has(lesson.id) ? <CheckCircle size={18} weight="fill"/> : <span className="cabinet-lesson-dot"/>}
          <span><b>{lesson.title}</b><small>{lesson.summary}</small></span>
        </button>
      </li>))}</ol>
    </div>)}
  </section>;
}

export function CourseCabinet({ navigate, course }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const lessons = course.lessons;
  const nextLesson = lessons && (lessons.flatLessons.find((lesson) => !getCompletedLessonIds(lessons.slug).includes(lesson.id)) || lessons.flatLessons[0]);
  const topicCount = course.modules.reduce((sum, module) => sum + module.topics.length, 0);
  const selected = course.modules.find((module) => module.n === selectedModule);
  return <main className={`course-dashboard course-dashboard-${course.slug}`}>
    <aside className="dashboard-rail" aria-label={`Навигация курса ${course.label}`}>
      <button className="dashboard-logo" onClick={() => navigate("/")}><span>GO</span>DEMY</button>
      <nav><button aria-label="Главная" onClick={() => navigate("/")}><House size={20}/></button><button className="active" aria-label={`Курс ${course.label}`}><BookOpen size={20}/></button><button aria-label={`Практика ${course.label}`} onClick={() => navigate(course.practicePath)}><Code size={20}/></button><button aria-label="Программа курса" onClick={() => setSelectedModule(course.modules[0].n)}><List size={20}/></button></nav>
      <button aria-label="Профиль" onClick={() => navigate("/profile")}><UserCircle size={21}/></button>
    </aside>
    <div className="dashboard-content">
      <section className="course-hero">
        <div className="course-hero-copy">
          <small>{course.kicker}</small>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          {lessons ? <div className="course-hero-actions">
            <button className="btn-primary" onClick={() => navigate(lessons.lessonPath(nextLesson))}>Начать уроки <ArrowRight size={18}/></button>
            <button className="btn-ghost" onClick={() => navigate(course.practicePath)}><Code size={17}/> Тренажёр</button>
          </div> : course.startLabel && <div className="course-hero-actions">
            <button className="btn-primary" onClick={() => navigate(course.firstPath)}>{course.startLabel} <ArrowRight size={18}/></button>
          </div>}
        </div>
        <div className="course-includes">
          <b>Что уже доступно</b>
          <ul>
            <li><Code size={16}/> {course.practiceSummary}</li>
            <li><Cube size={16}/> Программа: {modulesLabel(course.modules.length)} · {topicsLabel(topicCount)}</li>
            {course.project && <li><RocketLaunch size={16}/> {course.project.includes}</li>}
            <li><BookOpen size={16}/> {lessons ? `${lessonsLabel(lessons.flatLessons.length)} — готовят к проекту` : "Уроки курса в разработке"}</li>
          </ul>
        </div>
      </section>
      {course.project && <section className="cabinet-project">
        <div><small>ПРОЕКТ НА ВАШЕМ КОМПЬЮТЕРЕ</small><h2>{course.project.title}</h2><p>{course.project.summary}</p></div>
        <button className="btn-primary" onClick={() => navigate(course.project.path)}>Открыть проект <ArrowRight size={18}/></button>
      </section>}
      {lessons && <CourseLessons lessons={lessons} navigate={navigate}/>}
      <section className="course-draft-note"><BookOpen size={19}/><p>{lessons
        ? <><b>Полная программа ещё пишется.</b> Уроки выше дают всё, что нужно для проекта; ниже — план остальных модулей.</>
        : <><b>Курс ещё пишется.</b> Ниже — план программы, уроков по нему пока нет. {course.practiceHint}</>}</p></section>
      <section className="dashboard-program">
        <h2 className="course-syllabus-heading">Программа курса</h2>
        <div className="module-grid">{course.modules.map((module, index) =>
          <button className="module-card" key={module.n} onClick={() => setSelectedModule(module.n)}>
            <span className="module-card-tag locked">В плане</span>
            <div className="module-card-body">
              <h3>{module.title}</h3>
              <p>{module.text}</p>
              <div className="module-card-footer"><span><ChartBar size={14}/> {course.phases[index] || "МОДУЛЬ"}</span><span>{topicsLabel(module.topics.length)}</span></div>
            </div>
          </button>,
        )}</div>
      </section>
    </div>
    {selected && <div className="course-modal-backdrop" role="presentation" onMouseDown={() => setSelectedModule(null)}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="cabinet-module-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedModule(null)} aria-label="Закрыть"><X size={26}/></button><div className="modal-crumb"><span>Курс {course.label}</span><ArrowRight size={13}/><span>Модуль {selected.n}</span></div><h2 id="cabinet-module-title">{selected.title}</h2><p>{selected.text}</p><ul className="outline-plan">{selected.topics.map((topic, index) => <li key={topic}><span>{String(index + 1).padStart(2, "0")}</span><b>{topic}</b></li>)}</ul><p className="outline-plan-note">Уроки по этим темам ещё не написаны.</p></section></div>}
  </main>;
}
