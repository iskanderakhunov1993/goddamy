import { useState } from "react";
import {
  ArrowRight, BookOpen, Briefcase, Code, Flame, House, List,
  UserCircle, X,
} from "@phosphor-icons/react";

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
      <section className="dashboard-course-card"><div><small>{course.kicker}</small><h1>{course.title}</h1><p>{course.description}</p><div className="dashboard-progress"><span style={{ width: "0%" }}/></div><em>0% · {course.modules.length} модулей · {topicCount} тем · {lessonCount} уроков</em></div><div className="dashboard-course-actions"><button className="dashboard-continue" onClick={() => navigate(course.firstPath)}>{course.startLabel} <ArrowRight size={18}/></button><button className="dashboard-practice" onClick={() => navigate(course.practicePath)}><Code size={18}/> Практика {course.label}</button></div></section>
      <section className="dashboard-goal"><div className="goal-icon"><Flame size={20}/></div><div><b>Рабочий ритм: выберите 2 учебных вечера в неделю</b><p>Короткие уроки и практика помогают двигаться регулярно без жёсткого расписания.</p></div><button onClick={() => navigate("/profile")}>Открыть кабинет</button></section>
      <section className="dashboard-note"><Briefcase size={19}/><p><b>{course.role}</b> {course.nextStep}</p></section>
      <section className="dashboard-program"><div className="dashboard-grid">{course.modules.map((module, index) => <button className={`dashboard-stage ${index < 2 ? "active" : "locked"}`} key={module.n} onClick={() => setSelectedModule(module.n)}><span className="stage-number">{module.n}</span><h3>{module.title}</h3><p>{course.phases[index] || "МОДУЛЬ"} · {module.topics.length} тем · {module.topics.length * 5} уроков</p><i><span/></i></button>)}</div></section>
    </div>
    {selected && <div className="course-modal-backdrop" role="presentation" onMouseDown={() => setSelectedModule(null)}><section className="course-modal" role="dialog" aria-modal="true" aria-labelledby="cabinet-module-title" onMouseDown={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedModule(null)} aria-label="Закрыть"><X size={26}/></button><div className="modal-crumb"><span>Курс {course.label}</span><ArrowRight size={13}/><span>Модуль {selected.n}</span></div><h2 id="cabinet-module-title">{selected.title}</h2><p>{selected.text}</p><div className="outline-list">{selected.topics.map((topic, index) => <button key={topic} onClick={() => navigate(index === 0 ? course.firstPath : course.practicePath)}><span>{String(index + 1).padStart(2, "0")}</span><b>{topic}</b><em>5 уроков</em><ArrowRight size={17}/></button>)}</div></section></div>}
  </main>;
}
