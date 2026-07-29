import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Check, CheckCircle, Circle, Code,
  GithubLogo, Lightbulb, RocketLaunch, Target
} from "@phosphor-icons/react";
import { course, project, setupTasks, sprints, stages } from "../content/goCourse.js";

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

export function CoursePage({ navigate }) {
  return <main className="course-page">
    <section className="course-hero container">
      <div><small>БЕСПЛАТНЫЙ КУРС · 5 ПРОЕКТОВ</small><h1>{course.title}</h1><p>{course.description}</p><button className="primary" onClick={() => navigate("/go/task-tracker")}>Продолжить обучение <ArrowRight size={17}/></button></div>
      <div className="course-progress-card"><span>Ваш маршрут</span><strong>Проект 1 из 5</strong><ProgressBar value={0}/><p>Начните с консольного Task Tracker и первого commit.</p></div>
    </section>
    <section className="course-summary container">
      <article><small>КОМУ ПОДХОДИТ</small><h2>Начните с понятной задачи</h2><ul>{course.audience.map((item) => <li key={item}><Check size={16}/>{item}</li>)}</ul></article>
      <article><small>РЕЗУЛЬТАТ</small><h2>Научитесь создавать, а не повторять</h2><ul>{course.outcomes.map((item) => <li key={item}><Check size={16}/>{item}</li>)}</ul></article>
    </section>
    <section className="program-section container">
      <div className="section-heading"><small>ПРОГРАММА</small><h2>Пять проектов — от CLI до backend-сервиса</h2></div>
      <div className="project-program">{course.projects.map((item, index) =>
        <button key={item.id} disabled={item.status !== "Доступен"} onClick={() => navigate("/go/task-tracker")}>
          <span className="project-number">{String(index + 1).padStart(2, "0")}</span>
          <span><b>{item.title}</b><small>{item.description}</small></span>
          <em className={item.status === "Доступен" ? "available" : ""}>{item.status}</em>
          {item.status === "Доступен" && <ArrowRight size={18}/>}
        </button>
      )}</div>
    </section>
    <section className="technology-strip container"><small>ТЕХНОЛОГИИ</small><div>{course.technologies.map((item) => <span key={item}>{item}</span>)}</div><p><b>Итог курса:</b> портфолио из пяти проектов и уверенный рабочий процесс от задачи до release.</p></section>
  </main>;
}

export function ProjectPage({ navigate }) {
  return <LearningLayout current="project" navigate={navigate}>
    <article className="learning-article">
      <header className="learning-header"><small>ПРОЕКТ 1 · 4 СПРИНТА</small><h1>{project.title}</h1><p>{project.description}</p><button className="primary" onClick={() => navigate("/go/task-tracker/setup")}>Начать подготовку <ArrowRight size={17}/></button></header>
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
      <Checklist items={setupTasks} title="12 шагов до первого push"/>
      <PageNavigation current="setup" navigate={navigate}/>
    </article>
  </LearningLayout>;
}

function ContentBlock({ eyebrow, title, children, icon = null }) {
  return <section className="content-block">{icon}<small>{eyebrow}</small><h2>{title}</h2>{children}</section>;
}

export function SprintPage({ number, navigate }) {
  const sprint = sprints.find((item) => item.number === number) || sprints[0];
  const current = `sprint-${sprint.number}`;
  const [hint, setHint] = useState(null);
  return <LearningLayout current={current} navigate={navigate}>
    <article className="learning-article sprint-page">
      <header className="learning-header"><small>СПРИНТ {sprint.number} ИЗ 4</small><h1>{sprint.title}</h1><p>{sprint.situation}</p><div className="sprint-goal"><Target size={21}/><span><small>ЦЕЛЬ</small><b>{sprint.goal}</b></span></div></header>
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
