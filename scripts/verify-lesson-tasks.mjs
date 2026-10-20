// Проверка файла заданий уроков курса Go (нужен установленный Go):
//   node scripts/verify-lesson-tasks.mjs src/content/goLessonTasks/<тема>.js [--playground]
// Код-задания запускаются локальным Go: эталон должен работать, заготовка — компилироваться
// и печатать другой вывод. С --playground эталон дополнительно гоняется в Go Playground.
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const file = resolve(process.argv[2]);
const usePlayground = process.argv.includes("--playground");
const mod = await import(pathToFileURL(file).href + `?t=${Date.now()}`);
const exported = Object.values(mod).find((v) => v && typeof v === "object");
const { goChallenges } = await import(pathToFileURL(join(root, "src/content/goChallenges.js")).href);
const { courseCurriculum } = await import(pathToFileURL(join(root, "src/content/courseCurriculum.js")).href);
const lessonIds = new Set(courseCurriculum.flatMap((m) => m.topics.flatMap((t) => t.lessons.map((l) => l.id))));
const challengeIds = new Set(goChallenges.map((c) => c.id));
const work = mkdtempSync(join(tmpdir(), "godemy-tasks-"));
let failures = 0;
const fail = (msg) => { failures++; console.log("  ✗ " + msg); };

function goRun(name, source) {
  const dir = join(work, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "main.go"), source);
  writeFileSync(join(dir, "go.mod"), "module task\n\ngo 1.22\n");
  try {
    return { ok: true, out: execFileSync("go", ["run", "."], { cwd: dir, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 60000 }) };
  } catch (e) {
    return { ok: false, out: String(e.stderr || e.message).trim().split("\n").slice(0, 4).join(" | ") };
  }
}
function gofmtDiff(name, source) {
  const dir = join(work, name + "-fmt");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "a.go"), source + "\n");
  return execFileSync("gofmt", ["-l", dir], { encoding: "utf8" }).trim() !== "";
}
async function playground(source) {
  const res = await fetch("https://play.golang.org/compile", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ version: "2", body: source }) });
  const data = await res.json();
  if (data.Errors) return { ok: false, out: data.Errors };
  return { ok: true, out: (data.Events || []).filter((e) => e.Kind === "stdout").map((e) => e.Message).join("") };
}

const seen = new Set();
for (const [lessonId, tasks] of Object.entries(exported)) {
  console.log(`${lessonId} — заданий: ${tasks.length}`);
  if (!lessonIds.has(lessonId)) fail(`урока ${lessonId} нет в программе`);
  if (tasks.length < 3 || tasks.length > 5) fail(`в уроке должно быть 3–5 заданий, сейчас ${tasks.length}`);
  for (const task of tasks) {
    if (task.challenge) {
      if (!challengeIds.has(task.challenge)) fail(`нет задачи тренажёра ${task.challenge}`);
      else console.log(`  ✓ тренажёр: ${task.challenge}`);
      continue;
    }
    if (!task.id || seen.has(task.id)) fail(`id пустой или повторяется: ${task.id}`);
    seen.add(task.id);
    if (!task.title) fail(`${task.id}: нет title`);
    if (task.kind === "quiz") {
      const correct = (task.options || []).filter((o) => o.startsWith("*")).length;
      if (!task.question || correct !== 1 || (task.options || []).length < 3 || !task.explanation) fail(`${task.id}: квиз должен иметь вопрос, 3+ вариантов, ровно один верный (*) и объяснение`);
      else console.log(`  ✓ квиз: ${task.id}`);
      continue;
    }
    if (task.kind !== "code") { fail(`${task.id}: kind должен быть code или quiz`); continue; }
    for (const key of ["description", "starter", "harness", "referenceSolution", "hint"]) if (!task[key]) fail(`${task.id}: нет ${key}`);
    if (!Number.isInteger(task.minutes)) fail(`${task.id}: minutes должен быть целым числом`);
    if (!/^func main\(\) \{/.test((task.harness || "").trim()) || /^package |^import /m.test(task.harness || "")) fail(`${task.id}: harness — только func main() без package и import`);
    if (!/^package main/.test(task.starter || "") || !/^package main/.test(task.referenceSolution || "")) fail(`${task.id}: starter и reference начинаются с package main`);
    if (/func main\(/.test(task.starter + task.referenceSolution)) fail(`${task.id}: func main должен быть только в harness`);
    const ref = goRun(`${task.id}-ref`, `${task.referenceSolution}\n\n${task.harness}\n`);
    const st = goRun(`${task.id}-starter`, `${task.starter}\n\n${task.harness}\n`);
    if (!ref.ok) fail(`${task.id}: эталон не работает: ${ref.out}`);
    if (!st.ok) fail(`${task.id}: заготовка не компилируется (лишние импорты?): ${st.out}`);
    if (ref.ok && st.ok && ref.out === st.out) fail(`${task.id}: заготовка печатает то же, что эталон`);
    if (ref.ok && !ref.out.trim()) fail(`${task.id}: эталон ничего не печатает`);
    if (gofmtDiff(`${task.id}-s`, task.starter) || gofmtDiff(`${task.id}-r`, task.referenceSolution)) fail(`${task.id}: код не отформатирован gofmt (табы, пробелы)`);
    const again = ref.ok ? goRun(`${task.id}-ref2`, `${task.referenceSolution}\n\n${task.harness}\n`) : null;
    if (again && again.out !== ref.out) fail(`${task.id}: вывод эталона меняется от запуска к запуску`);
    if (usePlayground && ref.ok) {
      const pg = await playground(`${task.referenceSolution}\n\n${task.harness}\n`);
      if (!pg.ok || pg.out !== ref.out) fail(`${task.id}: в Go Playground вывод другой или ошибка: ${String(pg.out).slice(0, 200)}`);
    }
    if (ref.ok && st.ok && ref.out !== st.out) console.log(`  ✓ код: ${task.id} → ${ref.out.trim().split("\n").slice(0, 3).join(" / ")}`);
  }
}
console.log(failures ? `\nОшибок: ${failures}` : "\nВсё в порядке");
process.exit(failures ? 1 : 0);
