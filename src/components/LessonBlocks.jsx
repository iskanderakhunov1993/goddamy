function safeExternalUrl(value, allowImage = false) {
  if (typeof value !== "string") return "";
  if (allowImage && value.startsWith("data:image/")) return value;
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
    if (block.type === "code") return <figure className="lesson-code-block" key={block.id}><figcaption>{block.language || "code"}</figcaption><pre><code>{block.code || ""}</code></pre></figure>;
    if (block.type === "callout") return <aside className={`lesson-callout ${block.tone || "info"}`} key={block.id}><b>{block.title}</b><p><InlineText text={block.text}/></p></aside>;
    if (block.type === "quiz") return <QuizBlock block={block} key={block.id}/>;
    if (block.type === "task") return <TaskBlock block={block} key={block.id}/>;
    if (block.type === "divider") return <hr className="lesson-divider" key={block.id}/>;
    return null;
  })}</section>;
}

function InlineText({ text = "" }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\))/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
    if (link) return <a key={index} href={safeExternalUrl(link[2])} target="_blank" rel="noreferrer">{link[1]}</a>;
    return part;
  });
}

function QuizBlock({ block }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const options = (block.options || []).filter(Boolean);
  const correctIndex = options.findIndex((option) => option.startsWith("*"));
  const isCorrect = checked && selected === correctIndex;
  return <section className="lesson-mini-quiz"><small>ПРОВЕРЬТЕ СЕБЯ</small><h3>{block.question}</h3>{options.map((option, index) => <label className={checked && index === correctIndex ? "correct" : checked && selected === index ? "wrong" : ""} key={index}><input type="radio" name={`quiz-${block.id}`} checked={selected === index} onChange={() => { setSelected(index); setChecked(false); }}/><span/>{option.replace(/^\*/, "")}</label>)}<button type="button" disabled={selected === null} onClick={() => setChecked(true)}>Проверить ответ</button>{checked && <p className={isCorrect ? "quiz-result success" : "quiz-result"}>{isCorrect ? "Верно. " : "Пока нет. "}{block.explanation}</p>}</section>;
}

function TaskBlock({ block }) {
  const [done, setDone] = useState([]);
  const items = (block.checklist || []).filter(Boolean);
  return <section className="lesson-practice-task"><small>ПРАКТИКА</small><h3>{block.title}</h3><p><InlineText text={block.text}/></p>{items.map((item, index) => <label key={index}><input type="checkbox" checked={done.includes(index)} onChange={() => setDone((value) => value.includes(index) ? value.filter((itemIndex) => itemIndex !== index) : [...value, index])}/><span/>{item}</label>)}</section>;
}
import { useState } from "react";
