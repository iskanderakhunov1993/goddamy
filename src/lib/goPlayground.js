const PLAYGROUND_URL = "https://play.golang.org/compile";

export function assembleSource(userCode, harness) {
  return `${userCode}\n\n${harness}\n`;
}

export async function runGoProgram(source) {
  const body = new URLSearchParams({ version: "2", body: source });
  const response = await fetch(PLAYGROUND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new Error(`Playground недоступен (HTTP ${response.status})`);
  }
  const data = await response.json();
  if (data.Errors) {
    return { status: "compile-error", stdout: "", message: data.Errors };
  }
  const events = data.Events || [];
  const stdout = events.filter((event) => event.Kind === "stdout").map((event) => event.Message).join("");
  const stderr = events.filter((event) => event.Kind === "stderr").map((event) => event.Message).join("");
  if (stderr) {
    return { status: "runtime-error", stdout, message: stderr };
  }
  return { status: "ok", stdout, message: "" };
}

export async function checkSolution(challenge, userCode) {
  const userResult = await runGoProgram(assembleSource(userCode, challenge.harness));
  if (userResult.status !== "ok") {
    return { ...userResult, matched: false };
  }
  const referenceResult = await runGoProgram(assembleSource(challenge.referenceSolution, challenge.harness));
  const matched = referenceResult.status === "ok" && userResult.stdout === referenceResult.stdout;
  return { ...userResult, matched };
}
