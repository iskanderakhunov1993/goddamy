// Страницы для родителей курса «Python для школьников»: детский лендинг и отчёт
// о прогрессе. Всё считается из реального прогресса на этом устройстве (или в
// аккаунте, если ребёнок вошёл) — никаких выдуманных цифр.
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Circle, Copy, Printer } from "@phosphor-icons/react";
import "../styles-school.css";
import { schoolTrack } from "../content/school/curriculum.js";
import { getCompletedLessonIds } from "../lib/progress.js";
import { getCourseDays } from "../lib/activity.js";

const EXAMPLES = [
  ["Деньги", "Сколько недель копить на наушники, хватит ли денег на покупки, какой сдачей отдать 653 рубля."],
  ["Оценки", "Перевести баллы контрольной в оценку и посчитать четвертную — и узнать, почему Python округляет 4.5 до 4."],
  ["Слова и тексты", "Проверить словарный диктант по английскому и зашифровать записку шифром Цезаря."],
  ["Дневник класса", "Найти лучшего ученика по среднему баллу и предметы, по которым кому-то нужна помощь."],
];

function formatDay(key) {
  return new Date(`${key}T00:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
}

function useSchoolProgress() {
  const lessonsDone = new Set(getCompletedLessonIds(schoolTrack.slug));
  const tasksDone = new Set(getCompletedLessonIds(schoolTrack.practiceSlug));
  const days = getCourseDays(schoolTrack.slug);
  return { lessonsDone, tasksDone, days };
}

export function KidsLanding({ navigate }) {
  const { lessonsDone, tasksDone } = useSchoolProgress();
  const started = lessonsDone.size + tasksDone.size > 0;
  return <main className="school-page">
    <nav className="school-nav"><button onClick={() => navigate("/")}><ArrowLeft size={16}/> Godemy</button><button onClick={() => navigate("/school/report")}>Отчёт для родителей</button></nav>
    <section className="school-hero">
      <small>ДЛЯ ШКОЛЬНИКОВ 11–16 ЛЕТ</small>
      <h1>Программирование на задачах из настоящей жизни</h1>
      <p>Ребёнок учит Python, решая то, с чем сталкивается сам: деньги, оценки, расписание, английские слова. Без игр ради игр — каждая задача имеет понятный смысл, а программа проверяет решение автоматически.</p>
      <div className="school-actions">
        <button className="btn-primary" onClick={() => navigate("/school")}>{started ? "Продолжить курс" : "Начать бесплатно"} <ArrowRight size={18}/></button>
        <button className="btn-ghost" onClick={() => navigate("/school/practice/save-money")}>Попробовать задачу</button>
      </div>
    </section>

    <section className="school-section">
      <h2>Какие задачи решает ребёнок</h2>
      <div className="school-grid">{EXAMPLES.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className="school-section">
      <h2>Как это устроено</h2>
      <ol className="school-steps">
        <li><b>Короткий урок.</b> 5–10 минут: объяснение и пример, который запускается одной кнопкой.</li>
        <li><b>Задача.</b> Ребёнок пишет код сам. Если ошибся — видит, что получилось, и подсказку.</li>
        <li><b>Проверка.</b> Программа запускает решение и сравнивает результат с правильным — оценку ставит не человек «на глаз».</li>
        <li><b>Объяснение.</b> После решения — почему это работает и где такое встречается в жизни.</li>
      </ol>
    </section>

    <section className="school-section school-facts">
      <h2>Что важно знать родителям</h2>
      <ul>
        <li><CheckCircle size={18} weight="fill"/> Всё работает в браузере на компьютере — ничего устанавливать не нужно.</li>
        <li><CheckCircle size={18} weight="fill"/> На платформе нет чатов и переписки с другими людьми.</li>
        <li><CheckCircle size={18} weight="fill"/> Прогресс виден в отчёте для родителей — его можно распечатать или отправить себе в мессенджер.</li>
        <li><CheckCircle size={18} weight="fill"/> Сейчас в курсе {schoolTrack.flatLessons.length} уроков и {schoolTrack.practice.challenges.length} задач; курс пополняется.</li>
      </ul>
    </section>
  </main>;
}

export function ParentReport({ navigate }) {
  const { lessonsDone, tasksDone, days } = useSchoolProgress();
  const [copied, setCopied] = useState(false);
  const lessons = schoolTrack.flatLessons;
  const tasks = schoolTrack.practice.challenges;
  const categories = [...new Set(tasks.map((task) => task.category))];
  const lastDay = days[days.length - 1];
  const nextLesson = lessons.find((lesson) => !lessonsDone.has(lesson.id));
  const nextTask = tasks.find((task) => !tasksDone.has(task.id));

  const text = [
    "Python для школьников — отчёт о прогрессе",
    `Уроков пройдено: ${lessons.filter((l) => lessonsDone.has(l.id)).length} из ${lessons.length}`,
    `Задач решено: ${tasks.filter((t) => tasksDone.has(t.id)).length} из ${tasks.length}`,
    ...categories.map((category) => {
      const all = tasks.filter((t) => t.category === category);
      return `• ${category}: ${all.filter((t) => tasksDone.has(t.id)).length} из ${all.length}`;
    }),
    `Дней с решением задач: ${days.length}${lastDay ? `, последний — ${formatDay(lastDay)}` : ""}`,
    nextTask ? `Следующая задача: «${nextTask.title}»` : "Все задачи решены!",
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return <main className="school-page school-report">
    <nav className="school-nav"><button onClick={() => navigate("/kids")}><ArrowLeft size={16}/> Для родителей</button><button onClick={() => navigate("/school")}>К курсу</button></nav>
    <header className="school-hero">
      <small>ОТЧЁТ ДЛЯ РОДИТЕЛЕЙ</small>
      <h1>Python для школьников</h1>
      <p>Данные с этого устройства{days.length || lessonsDone.size || tasksDone.size ? "" : " — пока ребёнок ничего не прошёл"}. Если ребёнок входит в аккаунт по почте, прогресс одинаковый на всех устройствах.</p>
      <div className="school-actions">
        <button className="btn-primary" onClick={copy}><Copy size={17}/> {copied ? "Скопировано" : "Скопировать отчёт"}</button>
        <button className="btn-ghost" onClick={() => window.print()}><Printer size={17}/> Распечатать</button>
      </div>
    </header>

    <section className="school-stats">
      <div><b>{lessons.filter((l) => lessonsDone.has(l.id)).length} / {lessons.length}</b><span>уроков пройдено</span></div>
      <div><b>{tasks.filter((t) => tasksDone.has(t.id)).length} / {tasks.length}</b><span>задач решено</span></div>
      <div><b>{days.length}</b><span>{lastDay ? `дней с задачами, последний ${formatDay(lastDay)}` : "дней с задачами"}</span></div>
    </section>

    <section className="school-section">
      <h2>Задачи по темам</h2>
      {categories.map((category) => <div className="school-report-group" key={category}>
        <h3>{category}</h3>
        <ul>{tasks.filter((t) => t.category === category).map((task) => <li key={task.id} className={tasksDone.has(task.id) ? "done" : ""}>
          {tasksDone.has(task.id) ? <CheckCircle size={18} weight="fill"/> : <Circle size={18}/>}
          <span>{task.title}</span><small>{task.level}</small>
        </li>)}</ul>
      </div>)}
    </section>

    <section className="school-section">
      <h2>Уроки</h2>
      <ul className="school-report-lessons">{lessons.map((lesson) => <li key={lesson.id} className={lessonsDone.has(lesson.id) ? "done" : ""}>
        {lessonsDone.has(lesson.id) ? <CheckCircle size={18} weight="fill"/> : <Circle size={18}/>}<span>{lesson.title}</span>
      </li>)}</ul>
      {(nextLesson || nextTask) && <p className="school-next">Что дальше: {nextLesson ? `урок «${nextLesson.title}»` : `задача «${nextTask.title}»`}.</p>}
    </section>
  </main>;
}
