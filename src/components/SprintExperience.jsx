import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Circle, DownloadSimple, Kanban, Target } from "@phosphor-icons/react";
import { courseCurriculum } from "../content/courseCurriculum.js";
import { courseLessonPath } from "../content/courseDraft.js";
import { sprintPath, sprintStages } from "../content/goSprints.js";
import { verifySprintRepo } from "../lib/githubCheck.js";
import { getCompletedLessonIds } from "../lib/progress.js";
import { WIP_LIMIT, getBoard, getRetro, getSubmission, moveCard, saveRetro } from "../lib/sprintState.js";
import { lessonsLabel } from "../lib/plural.js";
import { Checklist, LearningLayout, SprintDetails } from "./LearningPages.jsx";
import { LessonBlocks } from "./LessonBlocks.jsx";
import { RepoSubmission } from "./RepoSubmission.jsx";
import "../styles-sprint.css";

const submissionId = (sprint) => `sprint:${sprint.id}`;

function StageNavigation({ sprint, stageId, navigate }) {
  const index = sprintStages.findIndex((stage) => stage.id === stageId);
  const previous = sprintStages[index - 1];
  const next = sprintStages[index + 1];
  return <nav className="page-navigation" aria-label="Шаги спринта">
    {previous ? <button onClick={() => navigate(sprintPath(sprint, previous.id))}><ArrowLeft size={17}/><span><small>Назад</small>{previous.title}</span></button> : <span/>}
    {next ? <button className="next" onClick={() => navigate(sprintPath(sprint, next.id))}><span><small>Дальше</small>{next.title}</span><ArrowRight size={17}/></button> : <button className="next" onClick={() => navigate("/go")}><span><small>Спринт завершён</small>К программе</span><ArrowRight size={17}/></button>}
  </nav>;
}

function TaskStage({ sprint, navigate }) {
  const { ticket, contract } = sprint;
  return <>
    <header className="learning-header">
      <small>СПРИНТ {sprint.number} · {sprint.duration.toUpperCase()}</small>
      <h1>{sprint.title}</h1>
      <p>{sprint.summary}</p>
    </header>

    <section className="bc-ticket" aria-label="Задача спринта">
      <header><span className="bc-ticket-key">{ticket.key}</span><span>от роли «{ticket.from}» · {ticket.channel}</span></header>
      <h2>{ticket.title}</h2>
      {ticket.body.map((text) => <p key={text}>{text}</p>)}
      <h3>Критерии приёмки</h3>
      <ul className="bc-check-list">{ticket.acceptance.map((item) => <li key={item}><CheckCircle size={18} aria-hidden="true"/>{item}</li>)}</ul>
      <h3>Не входит в задачу</h3>
      <ul className="bc-plain-list">{ticket.outOfScope.map((item) => <li key={item}>{item}</li>)}</ul>
    </section>

    <section className="bc-section">
      <h2>Контракт API</h2>
      <p>Проверка спринта отправляет твоему серверу именно эти запросы и сверяет ответы.</p>
      <div className="bc-contract" role="table" aria-label="Маршруты сервиса">
        {contract.routes.map((route) => <div role="row" key={`${route.method} ${route.path}`}>
          <code role="cell"><b>{route.method}</b> {route.path}</code>
          <span role="cell">{route.success}{route.errors && <small>{route.errors}</small>}</span>
        </div>)}
      </div>
      <dl className="bc-examples">
        <div><dt>Тело запроса POST и PUT</dt><dd><code>{contract.bodyExample}</code></dd></div>
        <div><dt>Закладка в ответе</dt><dd><code>{contract.objectExample}</code></dd></div>
        <div><dt>Ошибка</dt><dd><code>{contract.errorExample}</code></dd></div>
      </dl>
      <LessonBlocks blocks={[{ id: `${sprint.id}-rules`, type: "list", items: contract.rules }]}/>
    </section>

    <section className="bc-section bc-result">
      <Target size={24} aria-hidden="true"/>
      <div><h2>Результат спринта</h2><p>{sprint.result}</p><div className="tag-list">{sprint.stack.map((item) => <span key={item}>{item}</span>)}</div></div>
    </section>

    <p className="bc-cta"><button className="bc-button" onClick={() => navigate(sprintPath(sprint, "learn"))}>К материалам <ArrowRight size={17}/></button></p>
  </>;
}

function LearnStage({ sprint, navigate }) {
  const section = courseCurriculum.find((item) => item.id === sprint.moduleId);
  const completed = new Set(getCompletedLessonIds("go"));
  const lessons = section ? section.topics.flatMap((topic) => topic.lessons) : [];
  const done = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return <>
    <header className="learning-header">
      <small>СПРИНТ {sprint.number} · ИЗУЧИ</small>
      <h1>Материалы к задаче</h1>
      <p>Короткая теория с примерами, которые запускаются прямо в уроке, документация и пример похожего сервиса. Читать всё подряд не обязательно: начни с того, чего пока не хватает.</p>
    </header>

    {section && <section className="bc-section">
      <div className="bc-section-head"><h2>Теория спринта</h2><span>{done} из {lessonsLabel(lessons.length)}</span></div>
      {section.topics.map((topic) => <div className="bc-topic" key={topic.id}>
        <h3>{topic.title}</h3>
        <ol>{topic.lessons.map((lesson) => <li key={lesson.id}>
          <button onClick={() => navigate(courseLessonPath({ ...lesson, topic, section }))}>
            {completed.has(lesson.id) ? <Check size={17} weight="bold" aria-label="Пройдено"/> : <Circle size={17} aria-hidden="true"/>}
            <span>{lesson.title}</span><ArrowRight size={16} aria-hidden="true"/>
          </button>
        </li>)}</ol>
      </div>)}
    </section>}

    <section className="bc-section">
      <h2>Документация</h2>
      <p>Первоисточники, к которым ты будешь возвращаться по ходу работы.</p>
      <ul className="bc-links">{sprint.docs.map((doc) => <li key={doc.url}><a href={doc.url} target="_blank" rel="noreferrer">{doc.title}</a><small>{doc.note}</small></li>)}</ul>
    </section>

    <section className="bc-section">
      <h2>Пример соседней команды: {sprint.neighbour.title}</h2>
      <p>{sprint.neighbour.intro}</p>
      <LessonBlocks blocks={[{ id: `${sprint.id}-neighbour`, type: "code", language: "go", code: sprint.neighbour.code, run: false }]}/>
      <h3>Что взять из примера</h3>
      <ul className="bc-check-list">{sprint.neighbour.takeaways.map((item) => <li key={item}><CheckCircle size={18} aria-hidden="true"/>{item}</li>)}</ul>
      <p className="check-note">{sprint.neighbour.gaps}</p>
    </section>

    <section className="bc-section">
      <h2>Тренажёр</h2>
      <p>Если синтаксис Go ещё не дошёл до автоматизма, реши пару задач в тренажёре: они короткие и проверяются сразу.</p>
      <p><button className="bc-button secondary" onClick={() => navigate("/go/practice")}>Открыть тренажёр Go <ArrowRight size={17}/></button></p>
    </section>
  </>;
}

const columns = [
  { id: "todo", title: "Очередь" },
  { id: "doing", title: "В работе" },
  { id: "done", title: "Готово" },
];

function SprintBoard({ sprint, navigate }) {
  const [board, setBoard] = useState(() => getBoard(sprint.id));
  const [notice, setNotice] = useState("");
  const statusOf = (task) => board[task.id] || "todo";
  const move = (task, status) => {
    const next = moveCard(sprint.id, task.id, status);
    if (!next) {
      const busy = sprint.tasks.find((item) => board[item.id] === "doing");
      setNotice(`В работе уже карточка «${busy?.title}». Сначала доведи её до «Готово»: лимит колонки — ${WIP_LIMIT}.`);
      return;
    }
    setBoard(next);
    setNotice("");
  };
  return <section className="bc-section">
    <div className="bc-section-head"><h2><Kanban size={24} aria-hidden="true"/> Доска спринта</h2><span>{sprint.tasks.filter((task) => statusOf(task) === "done").length} из {sprint.tasks.length} готово</span></div>
    <p>Задача разбита на шесть карточек. Порядок карточек совпадает с шагами отчёта проверки. Бери по одной: в колонке «В работе» действует лимит, как на настоящей Kanban-доске.</p>
    <p className="bc-board-notice" role="status">{notice}</p>
    <div className="bc-board">
      {columns.map((column) => {
        const cards = sprint.tasks.filter((task) => statusOf(task) === column.id);
        return <div className={`bc-column ${column.id}`} key={column.id}>
          <h3>{column.title}<span>{column.id === "doing" ? `${cards.length} / ${WIP_LIMIT}` : cards.length}</span></h3>
          {cards.length === 0 && <p className="bc-column-empty">{column.id === "doing" ? "Возьми карточку из очереди" : column.id === "done" ? "Готовые карточки появятся здесь" : "Очередь пуста"}</p>}
          {cards.map((task) => <article className="bc-card" key={task.id}>
            <small>Шаг {sprint.tasks.indexOf(task) + 1} проверки</small>
            <h4>{task.title}</h4>
            <p>{task.text}</p>
            <div className="bc-card-actions">
              {column.id === "todo" && <button className="bc-button small" onClick={() => move(task, "doing")}>Взять в работу</button>}
              {column.id === "doing" && <><button className="bc-button small" onClick={() => move(task, "done")}>Готово</button><button className="bc-link" onClick={() => move(task, "todo")}>Вернуть в очередь</button></>}
              {column.id === "done" && <button className="bc-link" onClick={() => move(task, "doing")}>Вернуть в работу</button>}
            </div>
            <details className="bc-card-help">
              <summary>Уроки и подсказки</summary>
              <ul>{task.lessons.map(([title, path]) => <li key={path}><button className="bc-link" onClick={() => navigate(path)}>{title}</button></li>)}</ul>
              {task.hints.map((hint, index) => <details className="sprint-hint" key={hint}><summary>Подсказка {index + 1}</summary><p>{hint}</p></details>)}
            </details>
          </article>)}
        </div>;
      })}
    </div>
  </section>;
}

function BuildStage({ sprint, navigate }) {
  return <div className="sprint-page">
    <header className="learning-header">
      <small>СПРИНТ {sprint.number} · СДЕЛАЙ</small>
      <h1>Проект {sprint.project}</h1>
      <p>Код пишется на твоём компьютере и лежит в твоём публичном репозитории. Готового решения в курсе нет.</p>
    </header>

    <section className="bc-section bc-files">
      <h2>Файлы проверки</h2>
      <p>Скачай оба файла и положи в репозиторий. Менять их нельзя: при сдаче они сверяются с файлами курса.</p>
      <ul>{sprint.files.map((file) => <li key={file.id}><a className="bc-button secondary" href={file.href} download={file.name}><DownloadSimple size={17} aria-hidden="true"/> {file.name}</a><small>{file.note}</small></li>)}</ul>
    </section>

    <Checklist items={sprint.setup} title="Подготовь репозиторий" storageId={`go-sprint-${sprint.id}-setup`}/>

    <SprintBoard sprint={sprint} navigate={navigate}/>

    <section className="sprint-check">
      <h2>Как понять, что готово</h2>
      <p>Запусти проверку в папке проекта. Она собирает твой сервер, поднимает его на свободном порту и отправляет настоящие HTTP-запросы по контракту.</p>
      <pre className="check-command"><code>go run check.go</code></pre>
      <p>В отчёте шесть шагов, по одному на карточку доски. Рядом с каждым ✗ написано, что пришло от сервера и что ожидалось. Спринт готов, когда в конце стоит «Итог: {sprint.checkTotal} из {sprint.checkTotal} проверок».</p>
      <p className="check-note">Одна из проверок использует детектор гонок Go. Если на твоей системе он недоступен, скрипт скажет об этом и пропустит её, а на GitHub она выполнится.</p>
    </section>

    <div className="sprint-more">
      <h2>Если нужна помощь</h2>
      <SprintDetails title="Сервер не запускается в проверке" note="Самая частая причина первой красной проверки">
        <p>Проверка передаёт порт в переменной окружения <code className="inline-code">PORT</code> и ждёт ответа на <code className="inline-code">/health</code> пять секунд. Если порт записан в коде числом, сервер слушает не там, где его ищут.</p>
      </SprintDetails>
      <SprintDetails title="Маршруты отвечают 404" note="Хотя хэндлеры написаны">
        <p>Маршруты вида <code className="inline-code">"GET /bookmarks/{"{id}"}"</code> работают с Go 1.22. Проверь строку <code className="inline-code">go</code> в файле go.mod: там должна быть версия 1.22 или новее.</p>
      </SprintDetails>
      <SprintDetails title="Проверка на GitHub красная, а локально зелёная" note="Смотри, что попало в commit">
        <p>GitHub видит только то, что отправлено через push. Выполни <code className="inline-code">git status</code>: файлы, которые остались только на твоём компьютере, будут в списке.</p>
      </SprintDetails>
    </div>

    <p className="bc-cta"><button className="bc-button" onClick={() => navigate(sprintPath(sprint, "submit"))}>К сдаче <ArrowRight size={17}/></button></p>
  </div>;
}

function SubmitStage({ sprint, navigate }) {
  const [submission, setSubmission] = useState(() => getSubmission(submissionId(sprint)));
  const repoName = sprint.id;
  return <>
    <header className="learning-header">
      <small>СПРИНТ {sprint.number} · СДАЙ</small>
      <h1>Проверка и сдача</h1>
      <p>В команде работу принимают по ссылке на репозиторий с зелёной проверкой. Здесь так же.</p>
    </header>

    <section className="bc-section">
      <h2>Перед сдачей</h2>
      <ol className="bc-steps">
        <li><b>Локальная проверка зелёная.</b> <code className="inline-code">go run check.go</code> заканчивается строкой «Итог: {sprint.checkTotal} из {sprint.checkTotal} проверок».</li>
        <li><b>Всё отправлено на GitHub.</b> <code className="inline-code">git status</code> не показывает изменений, <code className="inline-code">git push</code> выполнен.</li>
        <li><b>Проверка на GitHub зелёная.</b> На вкладке Actions у последнего запуска «Godemy check» стоит галочка. Обычно запуск занимает около минуты.</li>
      </ol>
    </section>

    <section className="bc-section">
      <h2>Сдай ссылку</h2>
      <RepoSubmission id={submissionId(sprint)} placeholder={`https://github.com/логин/${repoName}`} doneText="Спринт сдан." onChange={setSubmission}
        verify={(target) => verifySprintRepo(target, { files: sprint.files, workflowPath: sprint.workflowPath })}/>
      <p className="check-note">Что проверяет сайт: репозиторий открыт, оба файла проверки совпадают с файлами курса, последний запуск проверки на GitHub прошёл. Сам код запускает GitHub, а не Godemy. Запросы идут в открытый API GitHub, у него лимит 60 запросов в час с одного адреса.</p>
    </section>

    {submission?.ok && <section className="sprint-finish"><CheckCircle size={28}/><div><h2>Спринт сдан</h2><p>Остался последний шаг недели — ретроспектива.</p></div><button className="bc-button" onClick={() => navigate(sprintPath(sprint, "retro"))}>К ретроспективе <ArrowRight size={17}/></button></section>}
  </>;
}

function RetroStage({ sprint }) {
  const [saved, setSaved] = useState(() => getRetro(sprint.id));
  const [answers, setAnswers] = useState(saved.answers);
  const submitted = Boolean(getSubmission(submissionId(sprint))?.ok);
  const dirty = sprint.retro.some((item) => (answers[item.id] || "") !== (saved.answers[item.id] || ""));
  const save = (event) => {
    event.preventDefault();
    setSaved(saveRetro(sprint.id, answers));
  };
  return <>
    <header className="learning-header">
      <small>СПРИНТ {sprint.number} · РЕТРО</small>
      <h1>Ретроспектива</h1>
      <p>Три коротких ответа, пока спринт свежий в памяти. Их читаешь только ты: это заметки, с которых начнётся следующий спринт.</p>
    </header>

    {!submitted && <p className="bc-note">Ретроспективу пишут после сдачи. Заметки можно оставить уже сейчас: они сохранятся.</p>}

    <form className="retrospective-form bc-retro" onSubmit={save}>
      {sprint.retro.map((item) => <label key={item.id}><span>{item.question}</span><textarea rows={3} value={answers[item.id] || ""} placeholder={item.placeholder} onChange={(event) => setAnswers({ ...answers, [item.id]: event.target.value })}/></label>)}
      <div className="bc-retro-actions">
        <button className="bc-button" type="submit" disabled={!dirty}>Сохранить</button>
        <span role="status">{!dirty && saved.savedAt ? `Сохранено ${new Date(saved.savedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : ""}</span>
      </div>
    </form>

    <section className="bc-section">
      <h2>Что ты умеешь после спринта</h2>
      <ul className="bc-check-list">{sprint.learned.map((item) => <li key={item}><CheckCircle size={18} aria-hidden="true"/>{item}</li>)}</ul>
      <h3>Стек</h3>
      <div className="tag-list">{sprint.stack.map((item) => <span key={item}>{item}</span>)}</div>
    </section>

    <section className="bc-section">
      <h2>Что дальше</h2>
      <p>Следующий спринт пишется. В нём сервис будет ходить в чужой API, и появятся таймауты и работа с сетью со стороны клиента. Пока он не готов, реши задачи в тренажёре или улучши этот проект.</p>
    </section>
  </>;
}

const stageViews = { task: TaskStage, learn: LearnStage, build: BuildStage, submit: SubmitStage, retro: RetroStage };

export function GoSprintPage({ sprint, stageId = "task", navigate }) {
  const stage = sprintStages.find((item) => item.id === stageId) || sprintStages[0];
  const View = stageViews[stage.id];
  const layoutStages = sprintStages.map((item) => ({ id: item.id, title: item.title, path: sprintPath(sprint, item.id) }));
  return <LearningLayout current={stage.id} navigate={navigate} layoutStages={layoutStages} eyebrow={`СПРИНТ ${sprint.number}`} title={sprint.project} ariaLabel="Шаги спринта">
    <article className="learning-article bc-article">
      <View sprint={sprint} navigate={navigate}/>
      <StageNavigation sprint={sprint} stageId={stage.id} navigate={navigate}/>
    </article>
  </LearningLayout>;
}
