import { useState } from "react";
import {
  ArrowRight, ArrowsClockwise, ArrowsDownUp, BookOpen, BracketsCurly,
  Briefcase, ChartBar, ChartLineUp, Code, Cube, Database, FileCode,
  Funnel, Function, GitBranch, House, List, ListBullets,
  PresentationChart, RocketLaunch, ShareNetwork, SlidersHorizontal,
  Stack, Table, TerminalWindow, UserCircle, X,
} from "@phosphor-icons/react";

const artworkSets = {
  go: [TerminalWindow, BracketsCurly, ListBullets, Database, ShareNetwork, RocketLaunch],
  sql: [Table, Funnel, ArrowsDownUp, ChartBar, GitBranch, PresentationChart],
  python: [Function, ArrowsClockwise, ListBullets, FileCode, Cube, ChartLineUp],
};
const accentSets = {
  go: [Code, BracketsCurly, GitBranch, Stack, TerminalWindow, RocketLaunch],
  sql: [Database, SlidersHorizontal, Table, ChartLineUp, ShareNetwork, PresentationChart],
  python: [TerminalWindow, Function, Stack, BracketsCurly, Code, RocketLaunch],
};

export function ModuleArtwork({ course = "go", index = 0, number = null }) {
  const Primary = (artworkSets[course] || artworkSets.go)[index % 6];
  const Accent = (accentSets[course] || accentSets.go)[index % 6];
  return <div className="stage-art module-art" aria-hidden="true"><Primary className="module-art-primary" size={76} weight="thin"/><Accent className="module-art-accent" size={30} weight="thin"/><span>{number || String(index + 1).padStart(2, "0")}</span></div>;
}

export function CourseCabinet({ navigate, course }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const topicCount = course.modules.reduce((sum, module) => sum + module.topics.length, 0);
  const lessonCount = topicCount * 5;
  const selected = course.modules.find((module) => module.n === selectedModule);
  return <main className={`course-dashboard course-dashboard-${course.slug}`}>
    <aside className="dashboard-rail" aria-label={`Навигация курса ${course.label}`}>
      <button className="dashboard-logo" onClick={() => navigate("/")}><span>GO</span>DEMY</button>
      <nav><button aria-label="Главная" onClick={() => navigate("/")}><House size={20}/></button><button className="active" aria-label={`Курс ${course.label}`}><BookOpen size={20}/></button><button aria-label={`Практика ${course.label}`} onClick={() => navigate(course.practicePath)}><Code size={20}/></button><button aria-label="Программа курса" onClick={() => setSelectedModule(course.modules[0].n)}><List size={20}/></button></nav>
      <button aria-label="Профиль" onClick={() => navigate("/profile")}><UserCircle size={21}/></button>
    </aside>
    <div className="dashboard-content">
      <section className="dashboard-course-card"><div><small>{course.kicker}</small><h1>{course.title}</h1><p>{course.description}</p><div className="dashboard-progress"><span style={{ width: "0%" }}/></div><em>0% · {course.modules.length} модулей · {topicCount} тем · {lessonCount} уроков</em></div><div className="dashboard-course-actions"><button className="dashboard-continue" onClick={() => navigate(course.firstPath)}>{course.startLabel} <ArrowRight size={18}/></button></div></section>
      <section className="dashboard-practice-block"><div><Code size={25}/><div><small>ПРАКТИКА · {course.label.toUpperCase()}</small><h2>Закрепляйте знания в тренажёре</h2><p>Короткие задачи по темам курса с проверкой результата и подсказками.</p></div></div><button className="dashboard-practice" onClick={() => navigate(course.practicePath)}>Открыть практику <ArrowRight size={18}/></button></section>
      <section className="dashboard-note"><Briefcase size={19}/><p><b>{course.role}</b> {course.nextStep}</p></section>
      <section className="dashboard-program"><div className="dashboard-grid">{course.modules.map((module, index) => <button className={`dashboard-stage ${index < 2 ? "active" : "locked"}`} key={module.n} onClick={() => setSelectedModule(module.n)}><ModuleArtwork course={course.slug} index={index} number={module.n}/><h3>{module.title}</h3><p>{course.phases[index] || "МОДУЛЬ"} · {module.topics.length} тем · {module.topics.length * 5} уроков</p><i><span/></i></button>)}</div></section>
    </div>
    {selected && <div className="course-modal-backdrop" role="presentation" onMouseDown={() => setSelectedModule(null)}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="cabinet-module-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedModule(null)} aria-label="Закрыть"><X size={26}/></button><div className="modal-crumb"><span>Курс {course.label}</span><ArrowRight size={13}/><span>Модуль {selected.n}</span></div><h2 id="cabinet-module-title">{selected.title}</h2><p>{selected.text}</p><div className="outline-list">{selected.topics.map((topic, index) => <button key={topic} onClick={() => navigate(index === 0 ? course.firstPath : course.practicePath)}><span>{String(index + 1).padStart(2, "0")}</span><b>{topic}</b><em>5 уроков</em><ArrowRight size={17}/></button>)}</div></section></div>}
  </main>;
}
