import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, BookOpen, CheckCircle, DownloadSimple, Eye, FileText,
  Folder, Plus, Trash, ArrowUp, ArrowDown, ImageSquare, Quotes,
  TextT, ListBullets, ChatCircleText, LinkSimple, Code, Info,
  Question, ClipboardText, Minus, Copy,
} from "@phosphor-icons/react";
import {
  courseLessonPath, createEditorId, flattenCourse, loadCourseDraft,
  resetCourseDraft, saveCourseDraft,
} from "../content/courseDraft.js";
import "../styles-course-editor.css";
import "../styles-course-block-editor.css";

const firstSelection = (course) => ({
  level: "module",
  moduleId: course[0]?.id || null,
  topicId: null,
  lessonId: null,
});

const blockTypes = [
  { type: "heading", label: "Заголовок", icon: TextT },
  { type: "paragraph", label: "Текст", icon: FileText },
  { type: "image", label: "Изображение", icon: ImageSquare },
  { type: "quote", label: "Цитата", icon: Quotes },
  { type: "list", label: "Список", icon: ListBullets },
  { type: "dialogue", label: "Диалог", icon: ChatCircleText },
  { type: "link", label: "Ссылка", icon: LinkSimple },
  { type: "code", label: "Код", icon: Code },
  { type: "callout", label: "Вставка", icon: Info },
  { type: "quiz", label: "Тест", icon: Question },
  { type: "task", label: "Задание", icon: ClipboardText },
  { type: "divider", label: "Разделитель", icon: Minus },
];

const createBlock = (type) => ({
  id: createEditorId("block"), type,
  ...(type === "heading" ? { text: "Новый раздел", level: 2 } : {}),
  ...(type === "paragraph" ? { text: "Начните писать текст урока…" } : {}),
  ...(type === "image" ? { src: "", alt: "", caption: "" } : {}),
  ...(type === "quote" ? { text: "Важная мысль урока", author: "" } : {}),
  ...(type === "list" ? { items: ["Первый пункт", "Второй пункт"] } : {}),
  ...(type === "dialogue" ? { speaker: "Рома", role: "team lead", text: "Сообщение ученику", side: "team" } : {}),
  ...(type === "link" ? { text: "Полезный материал", url: "https://" } : {}),
  ...(type === "code" ? { language: "go", code: "package main\n\nfunc main() {\n\t// Ваш код\n}" } : {}),
  ...(type === "callout" ? { tone: "info", title: "Обратите внимание", text: "Короткое пояснение или важная деталь." } : {}),
  ...(type === "quiz" ? { question: "Выберите правильный вариант", options: ["*Правильный ответ", "Другой вариант"], explanation: "Объясните, почему ответ правильный." } : {}),
  ...(type === "task" ? { title: "Практическая задача", text: "Опишите, что нужно сделать самостоятельно.", checklist: ["Выполнить требование", "Проверить результат"] } : {}),
});

export function CourseEditor({ navigate }) {
  const [course, setCourse] = useState(loadCourseDraft);
  const [selection, setSelection] = useState(() => firstSelection(loadCourseDraft()));
  const [savedAt, setSavedAt] = useState(null);

  const activeModule = course.find((item) => item.id === selection.moduleId);
  const activeTopic = activeModule?.topics.find((item) => item.id === selection.topicId);
  const activeLesson = activeTopic?.lessons.find((item) => item.id === selection.lessonId);
  const totals = useMemo(() => ({
    modules: course.length,
    topics: course.reduce((sum, item) => sum + item.topics.length, 0),
    lessons: flattenCourse(course).length,
  }), [course]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (saveCourseDraft(course)) setSavedAt(new Date());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [course]);

  const updateModule = (changes) => setCourse((items) => items.map((item) => item.id === activeModule?.id ? { ...item, ...changes } : item));
  const updateTopic = (changes) => setCourse((items) => items.map((item) => item.id === activeModule?.id ? {
    ...item,
    topics: item.topics.map((topic) => topic.id === activeTopic?.id ? { ...topic, ...changes } : topic),
  } : item));
  const updateLesson = (changes) => setCourse((items) => items.map((item) => item.id === activeModule?.id ? {
    ...item,
    topics: item.topics.map((topic) => topic.id === activeTopic?.id ? {
      ...topic,
      lessons: topic.lessons.map((lesson) => lesson.id === activeLesson?.id ? { ...lesson, ...changes } : lesson),
    } : topic),
  } : item));

  const addModule = () => {
    const item = { id: createEditorId("module"), title: "Новый модуль", topics: [] };
    setCourse((items) => [...items, item]);
    setSelection({ level: "module", moduleId: item.id, topicId: null, lessonId: null });
  };
  const addTopic = () => {
    if (!activeModule) return;
    const item = { id: createEditorId("topic"), title: "Новая тема", lessons: [] };
    updateModule({ topics: [...activeModule.topics, item] });
    setSelection({ level: "topic", moduleId: activeModule.id, topicId: item.id, lessonId: null });
  };
  const addLesson = () => {
    if (!activeTopic) return;
    const item = {
      id: createEditorId("lesson"),
      title: "Новый урок",
      summary: "Коротко опишите, что ученик узнает в этом уроке.",
      objectives: ["Понять основную идею", "Применить её на практике"],
      blocks: [createBlock("heading"), createBlock("paragraph")],
    };
    updateTopic({ lessons: [...activeTopic.lessons, item] });
    setSelection({ level: "lesson", moduleId: activeModule.id, topicId: activeTopic.id, lessonId: item.id });
  };

  const deleteSelected = () => {
    if (!window.confirm("Удалить выбранный элемент? Это действие изменит локальный черновик.")) return;
    if (selection.level === "module" && activeModule) {
      const next = course.filter((item) => item.id !== activeModule.id);
      setCourse(next);
      setSelection(firstSelection(next));
    } else if (selection.level === "topic" && activeModule && activeTopic) {
      updateModule({ topics: activeModule.topics.filter((item) => item.id !== activeTopic.id) });
      setSelection({ level: "module", moduleId: activeModule.id, topicId: null, lessonId: null });
    } else if (selection.level === "lesson" && activeModule && activeTopic && activeLesson) {
      updateTopic({ lessons: activeTopic.lessons.filter((item) => item.id !== activeLesson.id) });
      setSelection({ level: "topic", moduleId: activeModule.id, topicId: activeTopic.id, lessonId: null });
    }
  };

  const exportCourse = () => {
    const blob = new Blob([JSON.stringify(course, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "godemy-course.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const restoreCourse = () => {
    if (!window.confirm("Вернуть исходную программу и удалить локальный черновик?")) return;
    const next = resetCourseDraft();
    setCourse(next);
    setSelection(firstSelection(next));
  };

  return <main className="course-editor-shell">
    <header className="editor-header">
      <div><button onClick={() => { saveCourseDraft(course); navigate("/go") }} aria-label="Назад к курсу"><ArrowLeft size={19}/></button><span><small>GODEMY</small><b>Редактор курса</b></span></div>
      <div className="editor-summary"><span>{totals.modules} модулей</span><span>{totals.topics} тем</span><span>{totals.lessons} уроков</span></div>
      <div className="editor-actions"><span className="editor-save-state"><CheckCircle size={16}/>{savedAt ? "Черновик сохранён" : "Сохранение…"}</span><button onClick={exportCourse}><DownloadSimple size={17}/> Экспорт</button><button onClick={restoreCourse}>Сбросить</button></div>
    </header>

    <div className="course-editor-layout">
      <aside className="editor-tree" aria-label="Структура курса">
        <div className="tree-heading"><span><BookOpen size={18}/> Структура курса</span><button onClick={addModule} aria-label="Добавить модуль"><Plus size={18}/></button></div>
        <nav>{course.map((courseModule, moduleIndex) => <div className="tree-module" key={courseModule.id}>
          <button className={selection.moduleId === courseModule.id && selection.level === "module" ? "selected" : ""} onClick={() => setSelection({ level: "module", moduleId: courseModule.id, topicId: null, lessonId: null })}><span>{String(moduleIndex + 1).padStart(2, "0")}</span><b>{courseModule.title}</b></button>
          {selection.moduleId === courseModule.id && <div className="tree-topics">{courseModule.topics.map((topic, topicIndex) => <div key={topic.id}>
            <button className={selection.topicId === topic.id && selection.level === "topic" ? "selected" : ""} onClick={() => setSelection({ level: "topic", moduleId: courseModule.id, topicId: topic.id, lessonId: null })}><Folder size={15}/><span>{topicIndex + 1}. {topic.title}</span></button>
            {selection.topicId === topic.id && <div className="tree-lessons">{topic.lessons.map((lesson, lessonIndex) => <button className={selection.lessonId === lesson.id ? "selected" : ""} key={lesson.id} onClick={() => setSelection({ level: "lesson", moduleId: courseModule.id, topicId: topic.id, lessonId: lesson.id })}><FileText size={14}/><span>{lessonIndex + 1}. {lesson.title}</span></button>)}</div>}
          </div>)}</div>}
        </div>)}</nav>
      </aside>

      <section className="editor-workspace">
        {!activeModule && <div className="editor-empty"><BookOpen size={30}/><h1>Добавьте первый модуль</h1><p>Начните со структуры курса, затем добавьте темы и уроки.</p><button className="primary" onClick={addModule}><Plus size={17}/> Добавить модуль</button></div>}

        {selection.level === "module" && activeModule && <EditorPanel eyebrow="МОДУЛЬ" title={activeModule.title} onDelete={deleteSelected}>
          <EditorField label="Название модуля"><input value={activeModule.title} onChange={(event) => updateModule({ title: event.target.value })}/></EditorField>
          <EntityList title="Темы модуля" buttonLabel="Добавить тему" onAdd={addTopic} empty="В модуле пока нет тем.">{activeModule.topics.map((topic, index) => <button key={topic.id} onClick={() => setSelection({ level: "topic", moduleId: activeModule.id, topicId: topic.id, lessonId: null })}><span>{String(index + 1).padStart(2, "0")}</span><b>{topic.title}</b><small>{topic.lessons.length} уроков</small></button>)}</EntityList>
        </EditorPanel>}

        {selection.level === "topic" && activeModule && activeTopic && <EditorPanel eyebrow={activeModule.title} title={activeTopic.title} onDelete={deleteSelected} onBack={() => setSelection({ level: "module", moduleId: activeModule.id, topicId: null, lessonId: null })}>
          <EditorField label="Название темы"><input value={activeTopic.title} onChange={(event) => updateTopic({ title: event.target.value })}/></EditorField>
          <EntityList title="Уроки темы" buttonLabel="Добавить урок" onAdd={addLesson} empty="В теме пока нет уроков.">{activeTopic.lessons.map((lesson, index) => <button key={lesson.id} onClick={() => setSelection({ level: "lesson", moduleId: activeModule.id, topicId: activeTopic.id, lessonId: lesson.id })}><span>{String(index + 1).padStart(2, "0")}</span><b>{lesson.title}</b><small>Урок</small></button>)}</EntityList>
        </EditorPanel>}

        {selection.level === "lesson" && activeModule && activeTopic && activeLesson && <EditorPanel eyebrow={`${activeModule.title} · ${activeTopic.title}`} title={activeLesson.title} onDelete={deleteSelected} onBack={() => setSelection({ level: "topic", moduleId: activeModule.id, topicId: activeTopic.id, lessonId: null })}>
          <div className="lesson-editor-grid">
            <EditorField label="Название урока"><input value={activeLesson.title} onChange={(event) => updateLesson({ title: event.target.value })}/></EditorField>
            <EditorField label="Краткое описание"><textarea rows={4} value={activeLesson.summary || ""} onChange={(event) => updateLesson({ summary: event.target.value })}/></EditorField>
            <EditorField label="Результаты урока" hint="Каждый результат — с новой строки"><textarea rows={6} value={(activeLesson.objectives || []).join("\n")} onChange={(event) => updateLesson({ objectives: event.target.value.split("\n").filter(Boolean) })}/></EditorField>
          </div>
          <LessonContentEditor lesson={activeLesson} onChange={(blocks) => updateLesson({ blocks })}/>
          <button className="editor-preview" onClick={() => { saveCourseDraft(course); navigate(courseLessonPath({ ...activeLesson, section: activeModule, topic: activeTopic })) }}><Eye size={18}/> Посмотреть урок глазами ученика</button>
        </EditorPanel>}
      </section>
    </div>
  </main>;
}

function LessonContentEditor({ lesson, onChange }) {
  const blocks = Array.isArray(lesson.blocks) ? lesson.blocks : [];
  const [dragIndex, setDragIndex] = useState(null);
  const addBlock = (type) => onChange([...blocks, createBlock(type)]);
  const updateBlock = (id, changes) => onChange(blocks.map((block) => block.id === id ? { ...block, ...changes } : block));
  const removeBlock = (id) => onChange(blocks.filter((block) => block.id !== id));
  const duplicateBlock = (block, index) => {
    const copy = { ...block, id: createEditorId("block") };
    const next = [...blocks];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };
  const moveBlock = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };
  const uploadImage = (block, file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      window.alert("Для локального черновика выберите изображение до 2 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateBlock(block.id, { src: String(reader.result), alt: block.alt || file.name });
    reader.readAsDataURL(file);
  };

  return <section className="lesson-block-editor">
    <div className="block-editor-heading"><div><small>СОДЕРЖАНИЕ УРОКА</small><h2>Соберите урок из блоков</h2><p>Добавляйте элементы и меняйте их порядок. Все изменения сразу появятся в предпросмотре.</p></div></div>
    <div className="block-add-menu" aria-label="Добавить блок">{blockTypes.map(({ type, label, icon: Icon }) => <button type="button" key={type} onClick={() => addBlock(type)}><Icon size={17}/>{label}</button>)}</div>
    {!blocks.length && <div className="blocks-empty"><FileText size={24}/><b>Содержание пока пустое</b><span>Добавьте заголовок или текст, чтобы начать урок.</span></div>}
    <div className="lesson-block-list">{blocks.map((block, index) => <article className={`lesson-editor-block ${dragIndex === index ? "is-dragging" : ""}`} key={block.id} draggable onDragStart={() => setDragIndex(index)} onDragEnd={() => setDragIndex(null)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex === null || dragIndex === index) return; const next = [...blocks]; const [moved] = next.splice(dragIndex, 1); next.splice(index, 0, moved); onChange(next); setDragIndex(null); }}>
      <header><span title="Перетащите блок">⋮⋮ {blockTypes.find((item) => item.type === block.type)?.label || "Блок"}</span><div><button type="button" onClick={() => duplicateBlock(block, index)} aria-label="Дублировать блок"><Copy size={15}/></button><button type="button" disabled={index === 0} onClick={() => moveBlock(index, -1)} aria-label="Поднять блок"><ArrowUp size={15}/></button><button type="button" disabled={index === blocks.length - 1} onClick={() => moveBlock(index, 1)} aria-label="Опустить блок"><ArrowDown size={15}/></button><button type="button" className="block-delete" onClick={() => removeBlock(block.id)} aria-label="Удалить блок"><Trash size={15}/></button></div></header>
      <BlockFields block={block} update={(changes) => updateBlock(block.id, changes)} upload={(file) => uploadImage(block, file)}/>
    </article>)}</div>
  </section>;
}

function BlockFields({ block, update, upload }) {
  if (block.type === "heading") return <div className="block-fields two"><EditorField label="Текст заголовка"><input value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField><EditorField label="Уровень"><select value={block.level || 2} onChange={(event) => update({ level: Number(event.target.value) })}><option value="2">H2 — раздел</option><option value="3">H3 — подраздел</option></select></EditorField></div>;
  if (block.type === "paragraph") return <EditorField label="Текст" hint="Абзацы разделяйте пустой строкой"><textarea rows={6} value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField>;
  if (block.type === "image") return <div className="block-fields"><div className="image-source"><EditorField label="Ссылка на изображение"><input type="url" placeholder="https://…" value={block.src?.startsWith("data:") ? "" : block.src || ""} onChange={(event) => update({ src: event.target.value })}/></EditorField><span>или</span><label className="image-upload"><ImageSquare size={18}/> Загрузить файл<input type="file" accept="image/*" onChange={(event) => upload(event.target.files?.[0])}/></label></div>{block.src && <img className="editor-image-preview" src={block.src} alt={block.alt || "Предпросмотр"}/>}<div className="block-fields two"><EditorField label="Описание для доступности"><input value={block.alt || ""} onChange={(event) => update({ alt: event.target.value })}/></EditorField><EditorField label="Подпись под изображением"><input value={block.caption || ""} onChange={(event) => update({ caption: event.target.value })}/></EditorField></div></div>;
  if (block.type === "quote") return <div className="block-fields"><EditorField label="Текст цитаты"><textarea rows={4} value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField><EditorField label="Автор или источник"><input value={block.author || ""} onChange={(event) => update({ author: event.target.value })}/></EditorField></div>;
  if (block.type === "list") return <EditorField label="Пункты списка" hint="Каждый пункт — с новой строки"><textarea rows={6} value={(block.items || []).join("\n")} onChange={(event) => update({ items: event.target.value.split("\n") })}/></EditorField>;
  if (block.type === "dialogue") return <div className="block-fields"><div className="block-fields two"><EditorField label="Имя"><input value={block.speaker || ""} onChange={(event) => update({ speaker: event.target.value })}/></EditorField><EditorField label="Роль"><input value={block.role || ""} onChange={(event) => update({ role: event.target.value })}/></EditorField></div><EditorField label="Реплика"><textarea rows={4} value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField><EditorField label="Сторона диалога"><select value={block.side || "team"} onChange={(event) => update({ side: event.target.value })}><option value="team">Сотрудник</option><option value="learner">Ученик</option></select></EditorField></div>;
  if (block.type === "link") return <div className="block-fields two"><EditorField label="Текст ссылки"><input value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField><EditorField label="Адрес"><input type="url" value={block.url || ""} onChange={(event) => update({ url: event.target.value })}/></EditorField></div>;
  if (block.type === "code") return <div className="block-fields"><EditorField label="Язык"><select value={block.language || "go"} onChange={(event) => update({ language: event.target.value })}><option value="go">Go</option><option value="bash">Terminal</option><option value="json">JSON</option><option value="text">Текст</option></select></EditorField><EditorField label="Код"><textarea className="code-input" rows={10} value={block.code || ""} onChange={(event) => update({ code: event.target.value })}/></EditorField></div>;
  if (block.type === "callout") return <div className="block-fields"><div className="block-fields two"><EditorField label="Тип"><select value={block.tone || "info"} onChange={(event) => update({ tone: event.target.value })}><option value="info">Информация</option><option value="tip">Совет</option><option value="warning">Важно</option><option value="error">Типичная ошибка</option></select></EditorField><EditorField label="Заголовок"><input value={block.title || ""} onChange={(event) => update({ title: event.target.value })}/></EditorField></div><EditorField label="Текст"><textarea rows={4} value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField></div>;
  if (block.type === "quiz") return <div className="block-fields"><EditorField label="Вопрос"><input value={block.question || ""} onChange={(event) => update({ question: event.target.value })}/></EditorField><EditorField label="Варианты" hint="Каждый с новой строки; правильный начинайте со *"><textarea rows={6} value={(block.options || []).join("\n")} onChange={(event) => update({ options: event.target.value.split("\n") })}/></EditorField><EditorField label="Объяснение после ответа"><textarea rows={3} value={block.explanation || ""} onChange={(event) => update({ explanation: event.target.value })}/></EditorField></div>;
  if (block.type === "task") return <div className="block-fields"><EditorField label="Название задания"><input value={block.title || ""} onChange={(event) => update({ title: event.target.value })}/></EditorField><EditorField label="Условие"><textarea rows={5} value={block.text || ""} onChange={(event) => update({ text: event.target.value })}/></EditorField><EditorField label="Критерии" hint="Каждый критерий — с новой строки"><textarea rows={5} value={(block.checklist || []).join("\n")} onChange={(event) => update({ checklist: event.target.value.split("\n") })}/></EditorField></div>;
  if (block.type === "divider") return <p className="divider-note">Разделитель создаёт визуальную паузу между частями урока.</p>;
  return null;
}

function EditorPanel({ eyebrow, title, onBack = null, onDelete, children }) {
  return <div className="editor-panel">
    <div className="editor-breadcrumb">{onBack && <button onClick={onBack}><ArrowLeft size={15}/> Назад</button>}<small>{eyebrow}</small></div>
    <div className="editor-title"><h1>{title}</h1><button className="delete" onClick={onDelete}><Trash size={17}/> Удалить</button></div>
    {children}
  </div>;
}

function EditorField({ label, hint = null, children }) {
  return <label className="editor-field"><span>{label}{hint && <small>{hint}</small>}</span>{children}</label>;
}

function EntityList({ title, buttonLabel, onAdd, empty, children }) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return <section className="editor-entities"><header><h2>{title}</h2><button onClick={onAdd}><Plus size={17}/> {buttonLabel}</button></header>{hasItems ? <div>{children}</div> : <p>{empty}</p>}</section>;
}
