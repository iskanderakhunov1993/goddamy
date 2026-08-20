import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Play, XCircle } from "@phosphor-icons/react";
import { getGoChallenge } from "../content/goChallenges.js";
import { checkSolution, runGoProgram, assembleSource } from "../lib/goPlayground.js";
import { recordPractice } from "../lib/activity.js";
import "../styles-sql.css";

export function GoTask({ challengeId, navigate }) {
  const challenge = getGoChallenge(challengeId);
  const [code, setCode] = useState(challenge.starter);
  const [tab, setTab] = useState("result");
  const [showHint, setShowHint] = useState(false);
  const [run, setRun] = useState({ status: "idle", stdout: "", message: "" });
  const [busy, setBusy] = useState(false);

  const execute = async () => {
    setBusy(true);
    setTab("result");
    recordPractice("go");
    try {
      const result = await runGoProgram(assembleSource(code, challenge.harness));
      setRun({ status: result.status === "ok" ? "ran" : result.status, stdout: result.stdout, message: result.message });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setTab("result");
    recordPractice("go");
    try {
      const result = await checkSolution(challenge, code);
      setRun({
        status: result.status === "ok" ? (result.matched ? "success" : "mismatch") : result.status,
        stdout: result.stdout,
        message: result.message,
      });
    } catch (error) {
      setRun({ status: "network-error", stdout: "", message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const resultTone = run.status === "success" ? "success" : ["mismatch", "compile-error", "runtime-error", "network-error"].includes(run.status) ? "error" : "";

  return (
    <main className="sql-task-shell">
      <header>
        <button onClick={() => navigate("/go/practice")}><ArrowLeft size={17}/> Все задачи</button>
        <span>Go · play.golang.org</span>
        <button onClick={() => navigate("/go")}>Программа курса</button>
      </header>
      <div className="sql-task-grid">
        <section className="sql-task-brief">
          <p className="academy-kicker">{challenge.level.toUpperCase()} · {challenge.minutes} МИН · {challenge.category.toUpperCase()}</p>
          <h1>{challenge.title}</h1>
          <p>{challenge.description}</p>
          <button onClick={() => setShowHint((value) => !value)}>{showHint ? "Скрыть подсказку" : "Показать подсказку"}</button>
          {showHint && <aside>{challenge.hint}</aside>}
        </section>
        <section className="sql-editor">
          <div className="sql-editor-top"><b>main.go</b><span>Go playground</span></div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck="false" aria-label="Редактор Go-кода"/>
          <div className="sql-runbar">
            <button onClick={() => setCode(challenge.starter)}>Сбросить</button>
            <button className="secondary" onClick={execute} disabled={busy}><Play size={15} weight="fill"/> Выполнить</button>
            <button className="primary" onClick={submit} disabled={busy}>Отправить <ArrowRight size={16}/></button>
          </div>
          <div className="sql-result-tabs">
            <button className={tab === "result" ? "active" : ""} onClick={() => setTab("result")}>Результат</button>
            <button className={tab === "harness" ? "active" : ""} onClick={() => setTab("harness")}>Что вызывается</button>
          </div>
          <div className={`sql-result ${resultTone}`}>
            {tab === "harness"
              ? <><header><b>main() тренажёра</b><span>только для чтения</span></header><pre className="sql-error-text" style={{ color: "#b8efdb" }}>{challenge.harness}</pre></>
              : <>
                  <header><b>Результат</b><span>{busy ? "Выполняется…" : run.status === "idle" ? "Предпросмотр" : run.status}</span></header>
                  {busy && <p>Компилируем и запускаем на play.golang.org…</p>}
                  {!busy && run.status === "idle" && <p>Нажмите «Выполнить», чтобы увидеть вывод программы.</p>}
                  {!busy && (run.status === "compile-error" || run.status === "runtime-error" || run.status === "network-error") && <pre className="sql-error-text">{run.message}</pre>}
                  {!busy && (run.status === "ran" || run.status === "success" || run.status === "mismatch") && <pre className="sql-error-text" style={{ color: "#eaf4f0" }}>{run.stdout || "(пустой вывод)"}</pre>}
                </>}
            {run.status === "success" && <div className="sql-verdict success"><CheckCircle size={18}/> Верно — вывод совпал с эталонным решением.</div>}
            {run.status === "mismatch" && <div className="sql-verdict error"><XCircle size={18}/> Код скомпилировался, но вывод пока не совпадает. {challenge.hint}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
