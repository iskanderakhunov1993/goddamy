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
import { SqlCoursePage, SqlTask, SqlTrainer } from "./components/SqlExperience.jsx";
import { PythonCoursePage, PythonTask, PythonTrainer } from "./components/PythonExperience.jsx";
import { BusinessPracticeComing, ProductCoursePage, QaCoursePage } from "./components/BusinessCourses.jsx";
import { QaTask, QaTrainer } from "./components/QaExperience.jsx";
import { TermsPage, PrivacyPage } from "./components/LegalPages.jsx";

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
      "/terms": "Условия использования — Godemy",
      "/privacy": "Политика конфиденциальности — Godemy",
    };
    const sprint = route.match(/^\/go\/task-tracker\/sprint\/([1-4])$/);
    const courseLesson = route.match(/^\/go\/lesson\/([^/]+)\/([^/]+)\/([^/]+)$/);
    document.title = courseLesson ? "Урок курса Основы Go — Godemy" : sprint ? `Спринт ${sprint[1]} · Task Tracker — Godemy` : titleByRoute[route] || "Godemy — обучение Go";
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
  const immersive = Boolean(taskMatch) || Boolean(sqlTaskMatch) || Boolean(pythonTaskMatch) || Boolean(qaTaskMatch) || route === "/trainer" || route === "/go/practice" || route === "/sql" || route === "/sql/practice" || route === "/python" || route === "/python/practice" || route === "/product" || route === "/product/practice" || route === "/qa" || route === "/qa/practice" || route === "/go" || route === "/lesson" || route === "/course-editor" || Boolean(lessonMatch);
  return <>{!immersive && <Header setPage={navigate}/>} {content}{!immersive && <Footer setPage={navigate}/>}</>;
}

function Footer({setPage}) {
  return <footer><Logo onHome={()=>setPage("/")}/><p>Практическое IT-обучение через курсы, проекты и проверяемые результаты.</p><div><button onClick={()=>setPage("/academy")}>Курс Go</button><button onClick={()=>setPage("/sql")}>Курс SQL</button><button onClick={()=>setPage("/python")}>Курс Python</button><button onClick={()=>setPage("/product")}>Product</button><button onClick={()=>setPage("/qa")}>QA</button><button onClick={()=>setPage("/certificates")}>Сертификаты</button><button onClick={()=>setPage("/terms")}>Условия</button><button onClick={()=>setPage("/privacy")}>Конфиденциальность</button></div><small>© 2026 Godemy · Практический учебный проект</small></footer>;
}
