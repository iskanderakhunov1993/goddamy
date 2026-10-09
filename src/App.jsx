import { useEffect, useState } from "react";
import { List, MagnifyingGlass, UserCircle, X } from "@phosphor-icons/react";
import { SearchOverlay } from "./components/SearchOverlay.jsx";
import {
  CertificatesPage, CoursePage, ProfilePage, ProjectPage, RetrospectivePage, SetupPage, SprintPage, StoryLesson, SubscriptionPage
} from "./components/LearningPages.jsx";
import { CourseEditor } from "./components/CourseEditor.jsx";
import { EditorAuthGate } from "./components/EditorAuthGate.jsx";
import { AcademyHub, PublicGoLanding, GoTrainer } from "./components/AcademyExperience.jsx";
import { GoTask } from "./components/GoTask.jsx";
import { getGoChallenge } from "./content/goChallenges.js";
import { SqlCoursePage, SqlTask, SqlTrainer } from "./components/SqlExperience.jsx";
import { getSqlChallenge } from "./content/sqlChallenges.js";
import { PythonCoursePage, PythonTask, PythonTrainer, getPythonChallenge } from "./components/PythonExperience.jsx";
import { BusinessPracticeComing, ProductCoursePage, QaCoursePage } from "./components/BusinessCourses.jsx";
import { QaTask, QaTrainer } from "./components/QaExperience.jsx";
import { getQaChallenge } from "./content/qaChallenges.js";
import { TermsPage, PrivacyPage } from "./components/LegalPages.jsx";
import { SecurityCoursePage, SecurityLesson, SecurityProject, SecurityTrainer, SecurityTask } from "./components/SecurityExperience.jsx";
import { getSecurityChallenge } from "./content/security/challenges.js";
import { TrackCoursePage, TrackLesson, TrackProject, TrackTrainer, TrackTask } from "./components/TrackExperience.jsx";
import { kubernetesTrack } from "./content/kubernetes/curriculum.js";
import { youtubeTrack } from "./content/youtube/curriculum.js";
import { pythonProjectTrack } from "./content/python/project.js";
import { sqlProjectTrack } from "./content/sql/project.js";
import { qaProjectTrack } from "./content/qa/project.js";
import { pythonLessons } from "./content/python/lessons.js";
import { sqlLessons } from "./content/sql/lessons.js";
import { qaLessons } from "./content/qa/lessons.js";
import { schoolTrack } from "./content/school/curriculum.js";
import { KidsLanding, ParentReport } from "./components/SchoolPages.jsx";

function Logo({ onHome }) {
  return <button className="logo" onClick={onHome}><span>GO</span>DEMY</button>;
}

function Header({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = (page) => setPage(page);
  return (
    <header className="site-header">
      <Logo onHome={() => nav("home")} />
      <nav>
        <button onClick={() => nav("/#courses")}>Курсы</button>
        <button className="hide-mobile" onClick={() => nav("/#certificate")}>Сертификаты</button>
        <button className="hide-mobile" onClick={() => nav("/#subscription")}>Подписка</button>
      </nav>
      <div className="header-actions">
        <button aria-label="Поиск" onClick={() => setSearchOpen(true)}><MagnifyingGlass size={20}/></button>
        <button className="hide-mobile" aria-label="Профиль" onClick={() => nav("/profile")}><UserCircle size={20}/></button>
        <button className="login hide-mobile" onClick={() => nav("/go")}>Начать</button>
        <button className="mobile-menu" aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"} aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={21}/> : <List size={21}/>}</button>
      </div>
      {searchOpen && <SearchOverlay navigate={nav} onClose={() => setSearchOpen(false)}/>}
      {menuOpen && <nav className="mobile-nav-panel" aria-label="Мобильная навигация">
        <button onClick={() => { nav("/#courses"); setMenuOpen(false); }}>Курсы</button>
        <button onClick={() => { nav("/#certificate"); setMenuOpen(false); }}>Сертификаты</button>
        <button onClick={() => { nav("/#subscription"); setMenuOpen(false); }}>Подписка</button>
        <button onClick={() => { nav("/go"); setMenuOpen(false); }}>Начать</button>
      </nav>}
    </header>
  );
}

function Home({ setPage }) {
  return <PublicGoLanding navigate={setPage}/>;
}

function Trainer({ setPage }) {
  return <GoTrainer navigate={setPage}/>;
}

export function App() {
  const legacyRoute = () => {
    const hash = location.hash.replace("#", "");
    if (location.pathname !== "/") return location.pathname;
    return ({ course: "/go", trainer: "/go/practice", lesson: "/lesson", task: "/go/practice" })[hash] || "/";
  };
  const [route, setRoute] = useState(legacyRoute);
  useEffect(() => {
    const update = () => setRoute(legacyRoute());
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  useEffect(() => {
    const titleByRoute = {
      "/": "Godemy — практические IT-курсы по подписке",
      "/academy": "Godemy — курс и тренажёр Go",
      "/go": "Курс Go с нуля до Junior — Godemy",
      "/go/practice": "Практика курса Go — Godemy",
      "/sql": "Интерактивный курс SQL — Godemy",
      "/sql/practice": "Практика курса SQL — Godemy",
      "/python": "Интерактивный курс Python — Godemy",
      "/python/practice": "Практика курса Python — Godemy",
      "/product": "Курс Product Management — Godemy",
      "/product/practice": "Практика Product Management — Godemy",
      "/qa": "Курс QA — Godemy",
      "/qa/practice": "Практика QA — Godemy",
      "/go/task-tracker": "Проект Task Tracker — Godemy",
      "/go/task-tracker/setup": "Подготовка к проекту — Godemy",
      "/go/task-tracker/retrospective": "Ретроспектива проекта — Godemy",
      "/profile": "Прогресс обучения — Godemy",
      "/certificates": "Сертификаты Godemy",
      "/subscription": "Подписка Godemy",
      "/course-editor": "Редактор курса — Godemy",
      "/security": "Основы кибербезопасности — Godemy",
      "/security/practice": "Практика: исправь уязвимость — Godemy",
      "/security/project": "Проект «Заметки» — Основы кибербезопасности",
      "/security/project/setup": "Подготовка проекта — Основы кибербезопасности",
      "/qa/project": "Проект «Тестирование интернет-магазина» — QA",
      "/qa/project/setup": "Подготовка проекта — QA",
      "/sql/project": "Проект «Аналитика интернет-магазина» — SQL",
      "/sql/project/setup": "Подготовка проекта — SQL",
      "/python/project": "Проект «Учёт расходов» — Python",
      "/python/project/setup": "Подготовка проекта — Python",
      "/kids": "Программирование для школьников — Godemy",
      "/school/report": "Отчёт для родителей — Python для школьников",
      "/school": "Python для школьников — Godemy",
      "/school/practice": "Задачи из жизни — Python для школьников",
      "/youtube": "YouTube с нуля — Godemy",
      "/youtube/project": "Проект «Пять видео» — YouTube с нуля",
      "/youtube/project/setup": "Подготовка проекта — YouTube с нуля",
      "/kubernetes": "Kubernetes и Kafka — Godemy",
      "/kubernetes/practice": "Практика: Kubernetes и Kafka — Godemy",
      "/terms": "Условия использования — Godemy",
      "/privacy": "Политика конфиденциальности — Godemy",
    };
    const sprint = route.match(/^\/go\/task-tracker\/sprint\/([1-4])$/);
    const courseLesson = route.match(/^\/go\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
    const goTask = route.match(/^\/(?:task|go\/practice)\/([^/]+)$/);
    const sqlTask = route.match(/^\/sql\/practice\/([^/]+)$/);
    const pythonTask = route.match(/^\/python\/practice\/([^/]+)$/);
    const qaTask = route.match(/^\/qa\/practice\/([^/]+)$/);
    const secTask = route.match(/^\/security\/practice\/([^/]+)$/);
    const secLesson = route.match(/^\/security\/lesson\//);
    const secSprint = route.match(/^\/security\/project\/sprint\/([1-4])$/);
    const k8sTask = route.match(/^\/kubernetes\/practice\/([^/]+)$/);
    const k8sLesson = route.match(/^\/kubernetes\/lesson\//);
    document.title = k8sTask ? `${kubernetesTrack.practice.getChallenge(k8sTask[1]).title} — Godemy`
      : k8sLesson ? "Урок · Kubernetes и Kafka — Godemy"
      : secSprint ? `Спринт ${secSprint[1]} · Проект «Заметки» — Godemy`
      : secLesson ? "Урок · Основы кибербезопасности — Godemy"
      : secTask ? `${getSecurityChallenge(secTask[1]).title} — Godemy`
      : courseLesson ? "Урок курса Основы Go — Godemy"
      : sprint ? `Спринт ${sprint[1]} · Task Tracker — Godemy`
      : goTask ? `${getGoChallenge(goTask[1]).title} — Godemy`
      : sqlTask ? `${getSqlChallenge(sqlTask[1]).title} — Godemy`
      : pythonTask ? `${getPythonChallenge(pythonTask[1]).title} — Godemy`
      : qaTask ? `${getQaChallenge(qaTask[1]).title} — Godemy`
      : titleByRoute[route] || "Godemy — обучение Go";
  }, [route]);
  const navigate = (target) => {
    const routes = { home: "/", course: "/go", trainer: "/go/practice", lesson: "/lesson", task: "/go/practice" };
    const next = routes[target] || target;
    if (next.startsWith("/#")) {
      const anchor = next.split("#")[1];
      history.pushState({}, "", next);
      setRoute("/");
      requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" }));
    } else {
      history.pushState({}, "", next);
      setRoute(next);
      window.scrollTo(0, 0);
    }
  };
  const sprintMatch = route.match(/^\/go\/task-tracker\/sprint\/([1-4])$/);
  const lessonMatch = route.match(/^\/go\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const taskMatch = route.match(/^\/(?:task|go\/practice)(?:\/([^/]+))?$/);
  const sqlTaskMatch = route.match(/^\/sql\/practice\/([^/]+)$/);
  const pythonTaskMatch = route.match(/^\/python\/practice\/([^/]+)$/);
  const qaTaskMatch = route.match(/^\/qa\/practice\/([^/]+)$/);
  const schoolLessonMatch = route.match(/^\/school\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const schoolTaskMatch = route.match(/^\/school\/practice\/([^/]+)$/);
  const courseLessonTrack = { python: pythonLessons, sql: sqlLessons, qa: qaLessons };
  const extraLessonMatch = route.match(/^\/(python|sql|qa)\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const qaSprintMatch = route.match(/^\/qa\/project\/sprint\/([1-4])$/);
  const sqlSprintMatch = route.match(/^\/sql\/project\/sprint\/([1-4])$/);
  const pySprintMatch = route.match(/^\/python\/project\/sprint\/([1-4])$/);
  const ytLessonMatch = route.match(/^\/youtube\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const ytSprintMatch = route.match(/^\/youtube\/project\/sprint\/([1-4])$/);
  const k8sLessonMatch = route.match(/^\/kubernetes\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const k8sTaskMatch = route.match(/^\/kubernetes\/practice\/([^/]+)$/);
  const secLessonMatch = route.match(/^\/security\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
  const secTaskMatch = route.match(/^\/security\/practice\/([^/]+)$/);
  const secSprintMatch = route.match(/^\/security\/project\/sprint\/([1-4])$/);
  let content;
  if (route === "/") content = <Home setPage={navigate}/>;
  else if (route === "/academy") content = <AcademyHub navigate={navigate}/>;
  else if (route === "/go") content = <CoursePage navigate={navigate}/>;
  else if (route === "/sql") content = <SqlCoursePage navigate={navigate}/>;
  else if (route === "/sql/practice") content = <SqlTrainer navigate={navigate}/>;
  else if (sqlTaskMatch) content = <SqlTask challengeId={sqlTaskMatch[1]} navigate={navigate} key={sqlTaskMatch[1]}/>;
  else if (route === "/python") content = <PythonCoursePage navigate={navigate}/>;
  else if (route === "/python/practice") content = <PythonTrainer navigate={navigate}/>;
  else if (pythonTaskMatch) content = <PythonTask challengeId={pythonTaskMatch[1]} navigate={navigate}/>;
  else if (route === "/kids") content = <KidsLanding navigate={navigate}/>;
  else if (route === "/school/report") content = <ParentReport navigate={navigate}/>;
  else if (route === "/school") content = <TrackCoursePage track={schoolTrack} navigate={navigate}/>;
  else if (route === "/school/practice") content = <TrackTrainer track={schoolTrack} navigate={navigate}/>;
  else if (schoolTaskMatch) content = <TrackTask track={schoolTrack} challengeId={schoolTaskMatch[1]} navigate={navigate} key={schoolTaskMatch[1]}/>;
  else if (schoolLessonMatch) content = <TrackLesson track={schoolTrack} sectionId={schoolLessonMatch[1]} topicId={schoolLessonMatch[2]} lessonId={schoolLessonMatch[3]} navigate={navigate} key={schoolLessonMatch[3]}/>;
  else if (extraLessonMatch) content = <TrackLesson track={courseLessonTrack[extraLessonMatch[1]]} sectionId={extraLessonMatch[2]} topicId={extraLessonMatch[3]} lessonId={extraLessonMatch[4]} navigate={navigate} key={extraLessonMatch[4]}/>;
  else if (route === "/qa/project") content = <TrackProject track={qaProjectTrack} stageId="overview" navigate={navigate} key="ao"/>;
  else if (route === "/qa/project/setup") content = <TrackProject track={qaProjectTrack} stageId="setup" navigate={navigate} key="as"/>;
  else if (qaSprintMatch) content = <TrackProject track={qaProjectTrack} stageId={`sprint-${qaSprintMatch[1]}`} navigate={navigate} key={`a${qaSprintMatch[1]}`}/>;
  else if (route === "/sql/project") content = <TrackProject track={sqlProjectTrack} stageId="overview" navigate={navigate} key="qo"/>;
  else if (route === "/sql/project/setup") content = <TrackProject track={sqlProjectTrack} stageId="setup" navigate={navigate} key="qs"/>;
  else if (sqlSprintMatch) content = <TrackProject track={sqlProjectTrack} stageId={`sprint-${sqlSprintMatch[1]}`} navigate={navigate} key={`q${sqlSprintMatch[1]}`}/>;
  else if (route === "/python/project") content = <TrackProject track={pythonProjectTrack} stageId="overview" navigate={navigate} key="po"/>;
  else if (route === "/python/project/setup") content = <TrackProject track={pythonProjectTrack} stageId="setup" navigate={navigate} key="ps"/>;
  else if (pySprintMatch) content = <TrackProject track={pythonProjectTrack} stageId={`sprint-${pySprintMatch[1]}`} navigate={navigate} key={`p${pySprintMatch[1]}`}/>;
  else if (route === "/youtube") content = <TrackCoursePage track={youtubeTrack} navigate={navigate}/>;
  else if (route === "/youtube/project") content = <TrackProject track={youtubeTrack} stageId="overview" navigate={navigate} key="yo"/>;
  else if (route === "/youtube/project/setup") content = <TrackProject track={youtubeTrack} stageId="setup" navigate={navigate} key="ys"/>;
  else if (ytSprintMatch) content = <TrackProject track={youtubeTrack} stageId={`sprint-${ytSprintMatch[1]}`} navigate={navigate} key={`y${ytSprintMatch[1]}`}/>;
  else if (ytLessonMatch) content = <TrackLesson track={youtubeTrack} sectionId={ytLessonMatch[1]} topicId={ytLessonMatch[2]} lessonId={ytLessonMatch[3]} navigate={navigate} key={ytLessonMatch[3]}/>;
  else if (route === "/kubernetes") content = <TrackCoursePage track={kubernetesTrack} navigate={navigate}/>;
  else if (route === "/kubernetes/practice") content = <TrackTrainer track={kubernetesTrack} navigate={navigate}/>;
  else if (k8sTaskMatch) content = <TrackTask track={kubernetesTrack} challengeId={k8sTaskMatch[1]} navigate={navigate} key={k8sTaskMatch[1]}/>;
  else if (k8sLessonMatch) content = <TrackLesson track={kubernetesTrack} sectionId={k8sLessonMatch[1]} topicId={k8sLessonMatch[2]} lessonId={k8sLessonMatch[3]} navigate={navigate} key={k8sLessonMatch[3]}/>;
  else if (route === "/security") content = <SecurityCoursePage navigate={navigate}/>;
  else if (route === "/security/project") content = <SecurityProject stageId="overview" navigate={navigate} key="overview"/>;
  else if (route === "/security/project/setup") content = <SecurityProject stageId="setup" navigate={navigate} key="setup"/>;
  else if (secSprintMatch) content = <SecurityProject stageId={`sprint-${secSprintMatch[1]}`} navigate={navigate} key={secSprintMatch[1]}/>;
  else if (route === "/security/practice") content = <SecurityTrainer navigate={navigate}/>;
  else if (secTaskMatch) content = <SecurityTask challengeId={secTaskMatch[1]} navigate={navigate} key={secTaskMatch[1]}/>;
  else if (secLessonMatch) content = <SecurityLesson sectionId={secLessonMatch[1]} topicId={secLessonMatch[2]} lessonId={secLessonMatch[3]} navigate={navigate} key={secLessonMatch[3]}/>;
  else if (route === "/product") content = <ProductCoursePage navigate={navigate}/>;
  else if (route === "/product/practice") content = <BusinessPracticeComing navigate={navigate} course="product"/>;
  else if (route === "/qa") content = <QaCoursePage navigate={navigate}/>;
  else if (route === "/qa/practice") content = <QaTrainer navigate={navigate}/>;
  else if (qaTaskMatch) content = <QaTask challengeId={qaTaskMatch[1]} navigate={navigate}/>;
  else if (route === "/go/task-tracker") content = <ProjectPage navigate={navigate}/>;
  else if (route === "/go/task-tracker/setup") content = <SetupPage navigate={navigate}/>;
  else if (sprintMatch) content = <SprintPage number={Number(sprintMatch[1])} navigate={navigate}/>;
  else if (route === "/go/task-tracker/retrospective") content = <RetrospectivePage navigate={navigate}/>;
  else if (route === "/profile") content = <ProfilePage navigate={navigate}/>;
  else if (route === "/certificates") content = <CertificatesPage navigate={navigate}/>;
  else if (route === "/subscription") content = <SubscriptionPage/>;
  else if (route === "/course-editor") content = <EditorAuthGate><CourseEditor navigate={navigate}/></EditorAuthGate>;
  else if (route === "/terms") content = <TermsPage navigate={navigate}/>;
  else if (route === "/privacy") content = <PrivacyPage navigate={navigate}/>;
  else if (lessonMatch) content = <StoryLesson sectionId={lessonMatch[1]} topicId={lessonMatch[2]} lessonId={lessonMatch[3]} navigate={navigate}/>;
  else if (route === "/lesson") content = <StoryLesson navigate={navigate}/>;
  else if (route === "/trainer" || route === "/go/practice") content = <Trainer setPage={navigate}/>;
  else if (taskMatch) content = <GoTask challengeId={taskMatch[1]} navigate={navigate} key={taskMatch[1]}/>;
  else content = <CoursePage navigate={navigate}/>;
  const immersive = route === "/kids" || route === "/school/report" || route === "/school" || route === "/school/practice" || Boolean(schoolTaskMatch) || Boolean(schoolLessonMatch) || Boolean(extraLessonMatch) || route === "/youtube" || Boolean(ytLessonMatch) || route === "/kubernetes" || route === "/kubernetes/practice" || Boolean(k8sTaskMatch) || Boolean(k8sLessonMatch) || route === "/security" || route === "/security/practice" || Boolean(secTaskMatch) || Boolean(secLessonMatch) || Boolean(taskMatch) || Boolean(sqlTaskMatch) || Boolean(pythonTaskMatch) || Boolean(qaTaskMatch) || route === "/trainer" || route === "/go/practice" || route === "/sql" || route === "/sql/practice" || route === "/python" || route === "/python/practice" || route === "/product" || route === "/product/practice" || route === "/qa" || route === "/qa/practice" || route === "/go" || route === "/lesson" || route === "/course-editor" || Boolean(lessonMatch);
  return <>{!immersive && <Header setPage={navigate}/>} {content}{!immersive && <Footer setPage={navigate}/>}</>;
}

function Footer({setPage}) {
  return <footer><Logo onHome={()=>setPage("/")}/><p>Практическое IT-обучение через курсы, проекты и проверяемые результаты.</p><div><button onClick={()=>setPage("/academy")}>Курс Go</button><button onClick={()=>setPage("/sql")}>Курс SQL</button><button onClick={()=>setPage("/python")}>Курс Python</button><button onClick={()=>setPage("/product")}>Product</button><button onClick={()=>setPage("/qa")}>QA</button><button onClick={()=>setPage("/certificates")}>Сертификаты</button><button onClick={()=>setPage("/terms")}>Условия</button><button onClick={()=>setPage("/privacy")}>Конфиденциальность</button></div><small>© 2026 Godemy · Практический учебный проект</small></footer>;
}
