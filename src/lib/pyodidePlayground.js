// Real client-side Python execution via Pyodide (CPython compiled to WASM),
// loaded lazily from CDN. Mirrors the shape of lib/goPlayground.js: a
// harness prints deterministic output for a few calls, and a solution is
// judged by diffing that output against the same harness run against a
// known-correct reference solution — not by inspecting the user's source.
const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { existing.addEventListener("load", resolve); if (existing.dataset.loaded) resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = () => reject(new Error("Не удалось загрузить Pyodide"));
    document.head.appendChild(script);
  });
}

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      await loadScript(`${PYODIDE_CDN}pyodide.js`);
      const pyodide = await window.loadPyodide({ indexURL: PYODIDE_CDN });
      // The default Pyodide build ships hashlib without OpenSSL, so
      // pbkdf2_hmac / scrypt-style helpers are missing. The official
      // "hashlib" package adds them; reload so already-imported modules
      // pick up the full implementation.
      // sqlite3 is likewise a separate package in Pyodide's stdlib split.
      await pyodide.loadPackage(["hashlib", "sqlite3", "pyyaml"]);
      pyodide.runPython("import importlib, hashlib, hmac\nimportlib.reload(hashlib)\nimportlib.reload(hmac)");
      return pyodide;
    })();
  }
  return pyodidePromise;
}

// Pyodide's traceback includes its own internal interpreter frames before
// the frame that actually runs the user's code (always the last
// `File "<exec>"` block) — strip everything above that so learners see
// their own error, not the WASM runtime's call stack.
function trimTraceback(message) {
  const marker = 'File "<exec>"';
  const index = message.lastIndexOf(marker);
  if (index === -1) return message;
  const lineStart = message.lastIndexOf("\n", index) + 1;
  return `Traceback (most recent call last):\n${message.slice(lineStart)}`;
}

export function assembleSource(userCode, harness) {
  return `${userCode}\n\n${harness}\n`;
}

export async function runPythonProgram(source) {
  const pyodide = await getPyodide();
  pyodide.setStdout({ batched: () => {} });
  pyodide.setStderr({ batched: () => {} });
  let stdout = "";
  let stderr = "";
  pyodide.setStdout({ batched: (text) => { stdout += `${text}\n`; } });
  pyodide.setStderr({ batched: (text) => { stderr += `${text}\n`; } });
  try {
    await pyodide.runPythonAsync(source);
  } catch (error) {
    const message = error?.message || String(error);
    const isSyntax = message.includes("SyntaxError") || message.includes("IndentationError");
    return { status: isSyntax ? "compile-error" : "runtime-error", stdout, message: trimTraceback(stderr || message) };
  }
  return { status: "ok", stdout, message: "" };
}

export async function checkSolution(challenge, userCode) {
  const userResult = await runPythonProgram(assembleSource(userCode, challenge.harness));
  if (userResult.status !== "ok") {
    return { ...userResult, matched: false };
  }
  const referenceResult = await runPythonProgram(assembleSource(challenge.referenceSolution, challenge.harness));
  const matched = referenceResult.status === "ok" && userResult.stdout === referenceResult.stdout;
  return { ...userResult, matched };
}
