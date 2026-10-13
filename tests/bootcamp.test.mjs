import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { courseCurriculum, authoredLessonIds } from "../src/content/courseCurriculum.js";
import { withNewModules } from "../src/content/courseDraft.js";
import { goSprints, getGoSprintByModule, sprintPath, sprintStages } from "../src/content/goSprints.js";
import { lessonContent } from "../src/content/lessonContent/index.js";
import { parseRepoUrl, verifyFirstRepo, verifySprintRepo } from "../src/lib/githubCheck.js";

const publicFile = (href) => new URL(`../public${href}`, import.meta.url);
const bootcampModules = courseCurriculum.filter((module) => module.id === "team-methods" || getGoSprintByModule(module.id));
const bootcampLessons = bootcampModules.flatMap((module) => module.topics.flatMap((topic) => topic.lessons));
const blockTypes = new Set(["heading", "paragraph", "image", "quote", "list", "dialogue", "link", "code", "callout", "quiz", "task", "submission", "divider"]);

test("the course runs foundation modules first, then numbered sprints", () => {
  assert.deepEqual(courseCurriculum.map((module) => `${module.phase} ${module.title}`), [
    "МОДУЛЬ 1 Старт",
    "МОДУЛЬ 2 Как работают команды",
    "МОДУЛЬ 3 База Go и инженерный подход",
    "МОДУЛЬ 4 · СПРИНТ 1 Первый HTTP-сервер",
    "МОДУЛЬ 5 · СПРИНТ 2 Task Tracker CLI",
    "МОДУЛЬ 6 · СПРИНТ 3 Expense Tracker",
    "МОДУЛЬ 7 · СПРИНТ 4 URL Shortener API",
    "МОДУЛЬ 8 Релиз и портфолио",
  ]);
  assert.equal(goSprints[0].number, 1);
  assert.equal(getGoSprintByModule(courseCurriculum[3].id), goSprints[0]);
  assert.ok(authoredLessonIds.has(goSprints[0].next.path.split("/").at(-1)), "следующий спринт начинается с написанного урока");
});

test("team topics live in one module, and moved lessons keep their ids", () => {
  const start = courseCurriculum.find((module) => module.id === "internship-start");
  const team = courseCurriculum.find((module) => module.id === "team-methods");
  assert.deepEqual(start.topics.map((topic) => topic.id), ["welcome", "setup"]);
  assert.deepEqual(team.topics[0].lessons.map((lesson) => lesson.id), ["internship-start-it-process-1", "internship-start-it-process-2", "internship-start-it-process-4", "internship-start-it-process-5"]);
  assert.equal(lessonContent["internship-start-it-process-3"], undefined, "урок про Agile и Scrum заменён модулем 2");
  const titles = courseCurriculum.flatMap((module) => module.topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.title)));
  assert.equal(new Set(titles).size, titles.length, "названия уроков не повторяются");
  const ids = courseCurriculum.flatMap((module) => module.topics.flatMap((topic) => topic.lessons.map((lesson) => lesson.id)));
  assert.equal(new Set(ids).size, ids.length);
});

test("every bootcamp lesson is authored, well-formed and ends with a check", () => {
  assert.ok(bootcampLessons.length >= 24);
  for (const lesson of bootcampLessons) {
    assert.ok(authoredLessonIds.has(lesson.id), `${lesson.id} не написан`);
    assert.ok(lesson.summary, lesson.id);
    assert.equal(lesson.objectives.length, 3, lesson.id);
    for (const block of lesson.blocks) {
      assert.ok(blockTypes.has(block.type), `${lesson.id}: неизвестный блок ${block.type}`);
      if (block.type === "quiz") {
        assert.equal(block.options.filter((option) => option.startsWith("*")).length, 1, `${lesson.id}: в квизе должен быть один верный ответ`);
        assert.ok(block.explanation, lesson.id);
      }
      if (block.type === "image") assert.ok(existsSync(publicFile(block.src)), `${lesson.id}: нет картинки ${block.src}`);
      if (block.type === "dialogue") assert.match(block.speaker, /^(Тимлид|Аналитик|QA|Разработчик|Слабый вариант|Полезный вариант|Слабая запись|Полезная запись)$/, `${lesson.id}: реплика должна идти от роли, а не от персонажа`);
    }
    assert.ok(["quiz", "task", "submission"].includes(lesson.blocks.at(-1).type) || lesson.blocks.some((block) => block.type === "quiz" || block.type === "task"), `${lesson.id}: нужен квиз или практика`);
  }
});

test("bootcamp copy addresses the learner as «ты» without gendered forms", () => {
  const text = JSON.stringify([bootcampLessons.map((lesson) => lessonContent[lesson.id]), goSprints]);
  assert.doesNotMatch(text, /Bit Tech|\/characters\/|avatar/i);
  assert.doesNotMatch(text, /[Тт]ы (сделал|написал|готов|должен|научился|узнал|встречал|отправил)(?![а-яё])/);
  assert.doesNotMatch(text, /(^|[\s«(])[Вв]ы (можете|должны|будете|узнаете)/);
});

test("a sprint is a five-step week with a ticket from a role and a contract", () => {
  assert.deepEqual(sprintStages.map((stage) => stage.id), ["task", "learn", "build", "submit", "retro"]);
  for (const sprint of goSprints) {
    assert.ok(courseCurriculum.some((module) => module.id === sprint.moduleId), `${sprint.id}: нет модуля с теорией`);
    assert.equal(sprint.ticket.from, "Тимлид");
    assert.equal(sprint.ticket.name, undefined, "у задачи нет персонажа с именем");
    assert.ok(sprint.ticket.body.length >= 2 && sprint.ticket.acceptance.length >= 4 && sprint.ticket.outOfScope.length >= 2);
    assert.ok(sprint.contract.routes.length >= 4);
    assert.ok(sprint.docs.length >= 3 && sprint.docs.every((doc) => /^https:\/\//.test(doc.url)));
    assert.ok(sprint.neighbour.code && sprint.neighbour.takeaways.length >= 3);
    assert.ok(sprint.retro.length === 3 && sprint.learned.length >= 4);
    assert.equal(sprintPath(sprint), `/go/sprint/${sprint.id}`);
    assert.equal(sprintPath(sprint, "retro"), `/go/sprint/${sprint.id}/retro`);
  }
});

test("sprint board cards point to written lessons and match the checker's steps", () => {
  for (const sprint of goSprints) {
    const check = readFileSync(publicFile(sprint.files.find((file) => file.id === "check").href), "utf8");
    const stepsBlock = check.match(/var steps = \[\]string\{([\s\S]*?)\n\}/)[1];
    assert.equal(stepsBlock.match(/^\t"[^"]+",$/gm).length, sprint.tasks.length, "карточек на доске столько же, сколько шагов в отчёте check.go");
    assert.equal(check.match(/^\s+check\(\d/gm).length, sprint.checkTotal, "checkTotal расходится с числом проверок в check.go");
    for (const route of sprint.contract.routes) assert.ok(check.includes(route.path.replace("{id}", "")), `check.go не проверяет ${route.path}`);
    for (const task of sprint.tasks) {
      assert.ok(task.hints.length >= 2, task.id);
      for (const [, path] of task.lessons) assert.ok(authoredLessonIds.has(path.split("/").at(-1)), `${task.id}: урок ${path} не написан`);
    }
  }
});

test("check files exist and the workflow runs the same check", () => {
  for (const sprint of goSprints) {
    for (const file of sprint.files) assert.ok(existsSync(publicFile(file.href)), file.href);
    const workflow = readFileSync(publicFile(sprint.files.find((file) => file.id === "workflow").href), "utf8");
    assert.match(workflow, /run: go run check\.go/);
    assert.equal(sprint.files.find((file) => file.id === "workflow").path, sprint.workflowPath);
  }
});

test("a saved editor draft gets modules added in code, in curriculum order", () => {
  const oldDraft = courseCurriculum.filter((module) => !bootcampModules.includes(module)).map((module) => ({ ...module, title: `${module.title} (правка)` }));
  const merged = withNewModules(oldDraft);
  assert.deepEqual(merged.map((module) => module.id), courseCurriculum.map((module) => module.id));
  assert.match(merged[0].title, /\(правка\)$/, "правки автора сохраняются");
  assert.equal(withNewModules(merged).length, courseCurriculum.length);
});

test("parseRepoUrl accepts GitHub repository links only", () => {
  assert.deepEqual(parseRepoUrl("https://github.com/anna-dev/bookmarks-api"), { owner: "anna-dev", repo: "bookmarks-api" });
  assert.deepEqual(parseRepoUrl(" github.com/a/b.git "), { owner: "a", repo: "b" });
  assert.deepEqual(parseRepoUrl("https://github.com/a/b/tree/main"), { owner: "a", repo: "b" });
  assert.deepEqual(parseRepoUrl("git@github.com:a/b.git"), { owner: "a", repo: "b" });
  for (const bad of ["", "https://gitlab.com/a/b", "https://github.com/a", "bookmarks-api", "https://github.com/a/.."]) assert.equal(parseRepoUrl(bad), null, bad);
});

const sprint = goSprints[0];
const target = { owner: "anna-dev", repo: "bookmarks-api" };
const courseFiles = Object.fromEntries(sprint.files.map((file) => [file.href, readFileSync(publicFile(file.href), "utf8")]));

// Подменяет GitHub: routes — ответы по подстроке адреса, остальное берётся из «зелёного» сценария.
function fakeGithub(overrides = {}) {
  const calls = [];
  const green = {
    "/repos/anna-dev/bookmarks-api/actions/runs": { status: 200, json: { workflow_runs: [
      { path: ".github/workflows/other.yml", status: "completed", conclusion: "failure", html_url: "https://github.com/x/other" },
      { path: sprint.workflowPath, status: "completed", conclusion: "success", head_sha: "abcdef1234567", html_url: "https://github.com/anna-dev/bookmarks-api/actions/runs/1" },
    ] } },
    "/repos/anna-dev/bookmarks-api/commits": { status: 200, json: [{ commit: { message: "chore: initialize project\n\nbody" } }] },
    "/repos/anna-dev/bookmarks-api": { status: 200, json: { full_name: "anna-dev/bookmarks-api", default_branch: "main", html_url: "https://github.com/anna-dev/bookmarks-api" } },
    "raw.githubusercontent.com/anna-dev/bookmarks-api/main/check.go": { status: 200, text: courseFiles["/go-sprints/bookmarks-api/check.go"].replace(/\n/g, "\r\n") },
    "raw.githubusercontent.com/anna-dev/bookmarks-api/main/.github/workflows/godemy-check.yml": { status: 200, text: courseFiles["/go-sprints/bookmarks-api/godemy-check.yml"] },
  };
  const routes = { ...overrides, ...Object.fromEntries(Object.entries(green).filter(([key]) => !(key in overrides))) };
  const fetchImpl = async (url) => {
    calls.push(url);
    if (courseFiles[url]) return { ok: true, status: 200, text: async () => courseFiles[url] };
    const key = Object.keys(routes).find((part) => url.includes(part));
    const reply = key ? routes[key] : { status: 404 };
    if (reply.throws) throw new Error("network");
    return { ok: reply.status === 200, status: reply.status, json: async () => reply.json, text: async () => reply.text };
  };
  return { fetchImpl, calls };
}

const verify = (overrides) => {
  const { fetchImpl, calls } = fakeGithub(overrides);
  return verifySprintRepo(target, sprint, fetchImpl).then((result) => ({ ...result, calls }));
};
const stateOf = (result, id) => result.steps.find((step) => step.id === id)?.state;

test("a sprint is accepted when files are untouched and the latest check run is green", async () => {
  const result = await verify();
  assert.equal(result.ok, true);
  assert.deepEqual(result.steps.map((step) => step.state), ["ok", "ok", "ok", "ok"]);
  assert.equal(result.calls.filter((url) => url.startsWith("https://api.github.com")).length, 2, "одна проверка тратит два запроса из лимита API");
  assert.match(result.steps.at(-1).detail, /abcdef1/);
});

test("a sprint is rejected for a private repo, changed files, or a run that is red, running or missing", async () => {
  const missing = await verify({ "/repos/anna-dev/bookmarks-api": { status: 404 } });
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.steps.map((step) => step.id), ["repo"]);

  const edited = await verify({ "raw.githubusercontent.com/anna-dev/bookmarks-api/main/check.go": { status: 200, text: "package main\nfunc main() {}\n" } });
  assert.equal(edited.ok, false);
  assert.equal(stateOf(edited, "check"), "fail");

  const noWorkflow = await verify({ "raw.githubusercontent.com/anna-dev/bookmarks-api/main/.github/workflows/godemy-check.yml": { status: 404 } });
  assert.equal(stateOf(noWorkflow, "workflow"), "fail");

  const runs = (run) => ({ "/repos/anna-dev/bookmarks-api/actions/runs": { status: 200, json: { workflow_runs: run ? [{ path: sprint.workflowPath, html_url: "https://github.com/run", ...run }] : [] } } });
  const red = await verify(runs({ status: "completed", conclusion: "failure" }));
  assert.equal(red.ok, false);
  assert.equal(stateOf(red, "run"), "fail");
  const running = await verify(runs({ status: "in_progress", conclusion: null }));
  assert.equal(running.ok, false);
  assert.equal(stateOf(running, "run"), "wait");
  const none = await verify(runs(null));
  assert.equal(stateOf(none, "run"), "fail");
});

test("GitHub rate limit and network failures become a readable message, not a crash", async () => {
  const limited = await verify({ "/repos/anna-dev/bookmarks-api": { status: 403 } });
  assert.equal(limited.ok, false);
  assert.match(limited.error, /60 в час/);
  const offline = await verify({ "/repos/anna-dev/bookmarks-api": { throws: true } });
  assert.match(offline.error, /интернет/);
});

test("the tools module accepts a public repository with at least one commit", async () => {
  const good = await verifyFirstRepo(target, fakeGithub().fetchImpl);
  assert.equal(good.ok, true);
  assert.equal(good.steps.at(-1).detail, "chore: initialize project");
  const empty = await verifyFirstRepo(target, fakeGithub({ "/repos/anna-dev/bookmarks-api/commits": { status: 409 } }).fetchImpl);
  assert.equal(empty.ok, false);
  assert.equal(stateOf(empty, "commit"), "fail");
});

test("the sprint board keeps one card in progress and remembers submissions and retro", async () => {
  const store = new Map();
  globalThis.window = { localStorage: { getItem: (key) => (store.has(key) ? store.get(key) : null), setItem: (key, value) => store.set(key, String(value)) } };
  const state = await import(`../src/lib/sprintState.js?t=${Date.now()}`);
  assert.deepEqual(state.moveCard("s", "a", "doing"), { a: "doing" });
  assert.equal(state.moveCard("s", "b", "doing"), null, "вторая карточка в работу не берётся");
  assert.deepEqual(state.moveCard("s", "a", "done"), { a: "done" });
  assert.deepEqual(state.moveCard("s", "b", "doing"), { a: "done", b: "doing" });
  assert.deepEqual(state.moveCard("s", "b", "todo"), { a: "done" });
  assert.deepEqual(state.getBoard("s"), { a: "done" });
  assert.equal(state.getSubmission("sprint:s"), null);
  assert.equal(state.saveSubmission("sprint:s", "https://github.com/a/b", true).ok, true);
  assert.equal(state.getSubmission("sprint:s").url, "https://github.com/a/b");
  state.saveRetro("s", { worked: "сервер отвечает" });
  assert.equal(state.getRetro("s").answers.worked, "сервер отвечает");
  delete globalThis.window;
});
