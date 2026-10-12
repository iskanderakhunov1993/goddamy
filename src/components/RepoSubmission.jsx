import { useState } from "react";
import { ArrowSquareOut, CheckCircle, Clock, GithubLogo, XCircle } from "@phosphor-icons/react";
import { parseRepoUrl } from "../lib/githubCheck.js";
import { getSubmission, saveSubmission } from "../lib/sprintState.js";
import "../styles-sprint.css";

const stateIcon = {
  ok: <CheckCircle size={20} weight="fill" aria-label="Пройдено"/>,
  fail: <XCircle size={20} weight="fill" aria-label="Не пройдено"/>,
  wait: <Clock size={20} weight="fill" aria-label="Ещё выполняется"/>,
};

// Сдача работы ссылкой на публичный репозиторий. verify(target) делает проверку
// через открытый API GitHub и возвращает { ok, steps, error }.
export function RepoSubmission({ id, verify, placeholder = "https://github.com/логин/репозиторий", buttonLabel = "Проверить и сдать", doneText = "Работа сдана.", onChange = null }) {
  const [saved, setSaved] = useState(() => getSubmission(id));
  const [url, setUrl] = useState(saved?.url || "");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [inputError, setInputError] = useState("");
  const fieldId = `repo-${id.replace(/[^a-z0-9]+/gi, "-")}`;

  const submit = async (event) => {
    event.preventDefault();
    const target = parseRepoUrl(url);
    if (!target) {
      setInputError("Нужна ссылка на репозиторий вида https://github.com/логин/название.");
      return;
    }
    setInputError("");
    setBusy(true);
    setResult(null);
    try {
      const outcome = await verify(target);
      setResult(outcome);
      // Неудачная попытка не отменяет уже сданную работу.
      if (outcome.ok || !saved?.ok) {
        const next = saveSubmission(id, `https://github.com/${target.owner}/${target.repo}`, outcome.ok);
        setSaved(next);
        onChange?.(next);
      }
    } catch {
      setResult({ ok: false, steps: [], error: "Проверка не выполнилась. Обнови страницу и попробуй ещё раз." });
    } finally {
      setBusy(false);
    }
  };

  return <div className="bc-submission">
    {saved?.ok && <p className="bc-submission-done"><CheckCircle size={20} weight="fill" aria-hidden="true"/><span>{doneText} <a href={saved.url} target="_blank" rel="noreferrer">{saved.url.replace("https://", "")}</a></span></p>}
    <form onSubmit={submit} noValidate>
      <label htmlFor={fieldId}>Ссылка на репозиторий</label>
      <div className="bc-submission-row">
        <span className="bc-submission-input"><GithubLogo size={18} aria-hidden="true"/><input id={fieldId} type="url" inputMode="url" autoComplete="off" spellCheck="false" value={url} placeholder={placeholder} aria-invalid={Boolean(inputError)} aria-describedby={inputError ? `${fieldId}-error` : undefined} onChange={(event) => setUrl(event.target.value)}/></span>
        <button className="bc-button" type="submit" disabled={busy || !url.trim()}>{busy ? "Проверяю…" : buttonLabel}</button>
      </div>
      {inputError && <p className="bc-submission-error" id={`${fieldId}-error`} role="alert">{inputError}</p>}
    </form>
    <div aria-live="polite">
      {result?.error && <p className="bc-submission-error" role="alert">{result.error}</p>}
      {result?.steps?.length > 0 && <ul className="bc-submission-steps">{result.steps.map((item) => <li className={item.state} key={item.id}>
        {stateIcon[item.state]}
        <span><b>{item.label}</b>{item.detail && <small>{item.detail}</small>}{item.url && <a href={item.url} target="_blank" rel="noreferrer">Открыть на GitHub <ArrowSquareOut size={13} aria-hidden="true"/></a>}</span>
      </li>)}</ul>}
      {result && !result.error && <p className={`bc-submission-verdict ${result.ok ? "ok" : ""}`}>{result.ok ? "Все проверки пройдены." : "Пока не принято. Исправь пункты выше и проверь снова."}</p>}
    </div>
  </div>;
}
