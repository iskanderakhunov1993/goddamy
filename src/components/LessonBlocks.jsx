import { getQuizAnswer, saveQuizAnswer } from "../lib/quizAnswers.js";
import { getCheckedItems, toggleCheckedItem } from "../lib/taskChecklist.js";
import { runGoProgram } from "../lib/goPlayground.js";
import { runPythonProgram } from "../lib/pyodidePlayground.js";
import { SHOP_DB_PY } from "../lib/shopDbPython.js";

// A code block is runnable as-is only if it's a complete program, or if it's
// a plain sequence of statements with no top-level func/type declaration —
// those can be safely wrapped in a synthetic main(). A snippet that declares
// a func or type (most lesson examples) needs a caller/harness the lesson
// doesn't provide, so running it naively would just show a confusing
// compiler error about a missing func main — better to leave it copy-only.
// A lesson snippet demonstrating "here's how you declare a variable" is
// often never read afterward within the same fragment — Go would reject
// that as "declared and not used". Only top-level (non-indented) lines are
// scanned so loop/if-scoped variables from `for i := range ...` are never
// touched — referencing those after their block closes would itself be a
// compile error the snippet didn't have before wrapping.
function extractTopLevelNames(code) {
  const names = new Set();
  for (const line of code.split("\n")) {
    if (/^\s/.test(line)) continue;
    const shortDecl = line.match(/^([A-Za-z_][\w]*(?:\s*,\s*[A-Za-z_]\w*)*)\s*:=/);
    const varDecl = line.match(/^var\s+([A-Za-z_][\w]*(?:\s*,\s*[A-Za-z_]\w*)*)\s/);
    const match = shortDecl || varDecl;
    if (!match) continue;
    match[1].split(",").map((part) => part.trim()).filter((name) => name && name !== "_").forEach((name) => names.add(name));
  }
  return [...names];
}

const KNOWN_PACKAGES = {
  fmt: "fmt", os: "os", strconv: "strconv", errors: "errors", log: "log",
  strings: "strings", time: "time", math: "math", sort: "sort", bytes: "bytes",
  bufio: "bufio", json: "encoding/json",
};

// Snippets verified NOT to compile standalone once wrapped — they reference
// a variable or function declared in a *different* code block of the same
// lesson (e.g. `addTask` defined two blocks earlier), or need a live
// database/network connection. Ground-truthed once with the local Go
// compiler rather than guessed; re-run the same check if lesson content
// changes. Keyed by the block's own id (`${lessonId}-b${indexInLesson}`,
// assigned in content/courseCurriculum.js).
const NOT_SELF_CONTAINED = new Set([
  "go-foundations-go-core-3-b1", "go-foundations-go-core-3-b3", "go-foundations-go-core-3-b6",
  "go-foundations-data-model-3-b4", "go-foundations-quality-5-b1", "go-foundations-database-basics-5-b3",
  "project-task-tracker-task-cli-2-b3", "project-task-tracker-task-cli-5-b1",
  // фрагменты main: ждут аргументов командной строки или функций из других блоков
  "project-task-tracker-task-cli-1-b1", "project-task-tracker-task-cli-4-b3", "project-task-tracker-task-cli-4-b5",
  "project-task-tracker-task-storage-4-b5",
]);

function buildRunnableSource(code, blockId) {
  if (NOT_SELF_CONTAINED.has(blockId)) return null;
  const trimmed = code.trim();
  if (/package\s+main/.test(trimmed) && /func\s+main\s*\(/.test(trimmed)) return trimmed;
  if (/^\s*(func|type)\s/m.test(trimmed) || trimmed.startsWith("import")) return null;
  const usedPackages = Object.keys(KNOWN_PACKAGES).filter((pkg) => new RegExp(`\\b${pkg}\\.`).test(trimmed));
  const imports = usedPackages.map((pkg) => `\t"${KNOWN_PACKAGES[pkg]}"`).join("\n");
  const indented = trimmed.split("\n").map((line) => (line ? `\t${line}` : line)).join("\n");
  const keepAlive = extractTopLevelNames(trimmed).map((name) => `\t_ = ${name}`).join("\n");
  return `package main\n\n${imports ? `import (\n${imports}\n)\n\n` : ""}func main() {\n${indented}\n${keepAlive}\n}`;
}

function safeExternalUrl(value, allowImage = false) {
  if (typeof value !== "string") return "";
  if (allowImage && value.startsWith("data:image/")) return value;
  if (allowImage && /^\/[^/]/.test(value)) return value;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

export function LessonBlocks({ blocks }) {
  return <section className="lesson-custom-content">{blocks.map((block) => {
    if (block.type === "heading") return block.level === 3 ? <h3 key={block.id}><InlineText text={block.text}/></h3> : <h2 key={block.id}><InlineText text={block.text}/></h2>;
    if (block.type === "paragraph") return <div className="lesson-rich-paragraph" key={block.id}>{String(block.text || "").split(/\n\s*\n/).map((text, index) => <p key={`${block.id}-${index}`}><InlineText text={text}/></p>)}</div>;
    if (block.type === "image") {
      const src = safeExternalUrl(block.src, true);
      return src ? <figure className="lesson-media" key={block.id}><img src={src} alt={block.alt || ""}/>{block.caption && <figcaption>{block.caption}</figcaption>}</figure> : null;
    }
    if (block.type === "quote") return <blockquote key={block.id}><p><InlineText text={block.text}/></p>{block.author && <cite>{block.author}</cite>}</blockquote>;
    if (block.type === "list") return <ul key={block.id}>{(block.items || []).filter(Boolean).map((item, index) => <li key={`${block.id}-${index}`}><InlineText text={item}/></li>)}</ul>;
    if (block.type === "dialogue") return <div className={`chat-thread lesson-inline-dialogue ${block.side === "learner" ? "is-learner" : ""}`} key={block.id}><div className={`chat-message ${block.side === "learner" ? "learner" : "teammate"}`}><div><small>{block.speaker}{block.role ? ` · ${block.role}` : ""}</small><p>{block.text}</p></div></div></div>;
    if (block.type === "link") {
      const href = safeExternalUrl(block.url);
      return href ? <p className="lesson-resource" key={block.id}><a href={href} target="_blank" rel="noreferrer">{block.text || href}</a></p> : null;
    }
    if (block.type === "code") return <CodeBlock block={block} key={block.id}/>;
    if (block.type === "callout") return <aside className={`lesson-callout ${block.tone || "info"}`} key={block.id}><b>{block.title}</b><p><InlineText text={block.text}/></p></aside>;
    if (block.type === "quiz") return <QuizBlock block={block} key={block.id}/>;
    if (block.type === "task") return <TaskBlock block={block} key={block.id}/>;
    if (block.type === "divider") return <hr className="lesson-divider" key={block.id}/>;
    return null;
  })}</section>;
}

function InlineText({ text = "" }) {
  const parts = String(text).split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.length > 2 && part.startsWith("`") && part.endsWith("`")) return <code className="inline-code" key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={safeExternalUrl(link[2])} target="_blank" rel="noreferrer">{link[1]}</a>;
    return part;
  });
}

// SQL-блок с run: "shop" выполняется в Pyodide (sqlite3) на учебной базе магазина —
// той же, что ученик создаёт в проекте SQL командой python check.py --make-db.
function shopQuerySource(sql) {
  return `${SHOP_DB_PY}
db = build_db(":memory:", 1)
cur = db.execute(${JSON.stringify(sql.trim().replace(/;\s*$/, ""))})
rows = cur.fetchall()
names = [c[0] for c in cur.description or []]
print(" | ".join(names))
for row in rows[:30]:
    print(" | ".join(str(v) for v in row))
if len(rows) > 30:
    print(f"… ещё {len(rows) - 30} строк")
print(f"({len(rows)} строк)")
`;
}

function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const [run, setRun] = useState(null); // null | { busy } | { status, stdout, message }
  const isGo = !block.language || block.language === "go";
  const isShopSql = block.language === "sql" && block.run === "shop";
  // run: false — пример запускается только на компьютере ученика (например, импортирует его модуль).
  const isPython = (block.language === "python" && block.run !== false) || isShopSql;
  const runnableSource = isGo ? buildRunnableSource(block.code || "", block.id) : isShopSql ? shopQuerySource(block.code || "") : isPython ? block.code || "" : null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(block.code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const execute = async () => {
    setRun({ busy: true });
    try {
      const result = isPython ? await runPythonProgram(runnableSource) : await runGoProgram(runnableSource);
      setRun(result);
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    }
  };

  return <figure className="lesson-code-block">
    <figcaption>
      <span>{block.language || "code"}</span>
      <span className="lesson-code-actions">
        {runnableSource && <button type="button" onClick={execute} disabled={run?.busy}>{run?.busy ? (isPython ? "Загрузка Python…" : "Выполняется…") : "Запустить"}</button>}
        <button type="button" onClick={copy}>{copied ? "Скопировано" : "Копировать"}</button>
      </span>
    </figcaption>
    <pre><code>{block.code || ""}</code></pre>
    {run && !run.busy && <div className={`lesson-code-output ${run.status === "ok" ? "success" : "error"}`}>
      <pre>{run.status === "ok" ? (run.stdout || "(пустой вывод)") : run.message}</pre>
    </div>}
  </figure>;
}

function QuizBlock({ block }) {
  const saved = getQuizAnswer(block.id);
  const [selected, setSelected] = useState(saved);
  const [checked, setChecked] = useState(saved !== null);
  const options = (block.options || []).filter(Boolean);
  const correctIndex = options.findIndex((option) => option.startsWith("*"));
  const isCorrect = checked && selected === correctIndex;
  return <section className="lesson-mini-quiz"><small>ПРОВЕРЬТЕ СЕБЯ</small><h3>{block.question}</h3>{options.map((option, index) => <label className={checked && index === correctIndex ? "correct" : checked && selected === index ? "wrong" : ""} key={index}><input type="radio" name={`quiz-${block.id}`} checked={selected === index} onChange={() => { setSelected(index); setChecked(false); }}/><span/>{option.replace(/^\*/, "")}</label>)}<button type="button" disabled={selected === null} onClick={() => { setChecked(true); saveQuizAnswer(block.id, selected); }}>Проверить ответ</button>{checked && <p className={isCorrect ? "quiz-result success" : "quiz-result"}>{isCorrect ? "Верно. " : "Пока нет. "}{block.explanation}</p>}</section>;
}

function TaskBlock({ block }) {
  const [done, setDone] = useState(() => getCheckedItems(block.id));
  const items = (block.checklist || []).filter(Boolean);
  return <section className="lesson-practice-task"><small>ПРАКТИКА</small><h3>{block.title}</h3><p><InlineText text={block.text}/></p>{items.map((item, index) => <label key={index}><input type="checkbox" checked={done.includes(index)} onChange={() => setDone(toggleCheckedItem(block.id, index))}/><span/>{item}</label>)}</section>;
}
import { useState } from "react";
