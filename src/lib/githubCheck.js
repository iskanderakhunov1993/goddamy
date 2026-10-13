// Проверка сданной работы по ссылке на публичный репозиторий GitHub.
// Сервера у Godemy нет, поэтому код ученика запускает GitHub Actions в его же
// репозитории, а сайт читает результат через открытый API GitHub (без токена,
// лимит GitHub — 60 запросов в час с одного адреса; одна проверка спринта тратит два).

const API = "https://api.github.com";

export function parseRepoUrl(input) {
  const value = String(input || "").trim().replace(/^git@github\.com:/i, "https://github.com/");
  const match = value.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]+?)(?:\.git)?(?:[/?#].*)?$/i);
  if (!match || match[2] === "." || match[2] === "..") return null;
  return { owner: match[1], repo: match[2] };
}

class GithubError extends Error {}

async function api(path, fetchImpl) {
  let response;
  try {
    response = await fetchImpl(`${API}${path}`, { headers: { Accept: "application/vnd.github+json" } });
  } catch {
    throw new GithubError("Не получилось связаться с GitHub. Проверь интернет и попробуй ещё раз.");
  }
  if (response.status === 403 || response.status === 429) {
    throw new GithubError("GitHub временно ограничил запросы с твоего адреса (60 в час без входа). Попробуй через несколько минут.");
  }
  return { status: response.status, data: response.status === 200 ? await response.json() : null };
}

const step = (id, label, state, detail = "", url = "") => ({ id, label, state, detail, url });
const repoPath = ({ owner, repo }) => `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

async function findRepo(target, fetchImpl) {
  const { status, data } = await api(repoPath(target), fetchImpl);
  if (status !== 200) return { found: null, result: step("repo", "Репозиторий найден и открыт", "fail", "Репозиторий не найден. Проверь ссылку и убедись, что он публичный (Public), а не закрытый.") };
  return { found: data, result: step("repo", "Репозиторий найден и открыт", "ok", `${data.full_name}, ветка ${data.default_branch}`, data.html_url) };
}

// Результат модуля «Инструменты»: публичный репозиторий, в котором есть хотя бы один commit.
export async function verifyFirstRepo(target, fetchImpl = fetch) {
  try {
    const { found, result } = await findRepo(target, fetchImpl);
    if (!found) return { ok: false, steps: [result] };
    const commits = await api(`${repoPath(target)}/commits?per_page=1`, fetchImpl);
    const hasCommit = commits.status === 200 && Array.isArray(commits.data) && commits.data.length > 0;
    const commit = step("commit", "В репозитории есть commit", hasCommit ? "ok" : "fail", hasCommit ? String(commits.data[0].commit?.message || "").split("\n")[0] : "Репозиторий пустой. Сделай commit и отправь его командой git push.");
    return { ok: hasCommit, steps: [result, commit] };
  } catch (error) {
    if (error instanceof GithubError) return { ok: false, steps: [], error: error.message };
    throw error;
  }
}

// Сравнение идёт по содержимому: raw.githubusercontent.com не тратит лимит API,
// но обновляется с задержкой до пяти минут после push.
const normalize = (text) => text.replace(/\r\n/g, "\n").trimEnd();

async function sameFile(target, branch, file, fetchImpl) {
  const label = `Файл ${file.path} совпадает с файлом курса`;
  const rawUrl = `https://raw.githubusercontent.com/${target.owner}/${target.repo}/${encodeURIComponent(branch)}/${file.path}`;
  const read = (url) => fetchImpl(url).then((response) => (response.ok ? response.text() : null)).catch(() => undefined);
  const [remote, local] = await Promise.all([read(rawUrl), read(file.href)]);
  if (!local) throw new GithubError("Не получилось загрузить файлы проверки с сайта курса. Обнови страницу и попробуй ещё раз.");
  if (remote === undefined) throw new GithubError("Не получилось связаться с GitHub. Проверь интернет и попробуй ещё раз.");
  if (remote === null) return step(file.id, label, "fail", `В репозитории нет файла ${file.path}. Скачай его на шаге «Сделай» и добавь в commit.`);
  if (normalize(remote) !== normalize(local)) return step(file.id, label, "fail", `Файл ${file.path} в репозитории отличается от файла курса. Скачай его заново и не меняй. После push GitHub обновляет файл до пяти минут.`);
  return step(file.id, label, "ok");
}

// Сдача спринта: проверочные файлы не изменены, а последний запуск проверки на GitHub зелёный.
// files: [{ id, path, href }], workflowPath — путь файла workflow в репозитории.
export async function verifySprintRepo(target, { files, workflowPath }, fetchImpl = fetch) {
  const steps = [];
  try {
    const { found, result } = await findRepo(target, fetchImpl);
    steps.push(result);
    if (!found) return { ok: false, steps };
    const branch = found.default_branch;

    for (const file of files) steps.push(await sameFile(target, branch, file, fetchImpl));

    const label = "Последняя проверка на GitHub зелёная";
    const runs = await api(`${repoPath(target)}/actions/runs?branch=${encodeURIComponent(branch)}&per_page=30`, fetchImpl);
    const run = (runs.data?.workflow_runs || []).find((item) => item.path === workflowPath);
    if (!run) steps.push(step("run", label, "fail", "Запусков проверки пока нет. Отправь изменения командой git push и открой вкладку Actions в репозитории."));
    else if (run.status !== "completed") steps.push(step("run", label, "wait", "Проверка ещё выполняется. Подожди минуту и нажми «Проверить» снова.", run.html_url));
    else if (run.conclusion !== "success") steps.push(step("run", label, "fail", "Проверка на GitHub не прошла. Открой запуск, найди строки с ✗ и исправь их.", run.html_url));
    else steps.push(step("run", label, "ok", `commit ${String(run.head_sha || "").slice(0, 7)}`, run.html_url));

    return { ok: steps.every((item) => item.state === "ok"), steps };
  } catch (error) {
    if (error instanceof GithubError) return { ok: false, steps, error: error.message };
    throw error;
  }
}
