// Лёгкая подсветка синтаксиса для блоков кода в уроках: комментарии, строки,
// числа и ключевые слова. Без зависимостей; неизвестный язык возвращается как есть.
const KEYWORDS = {
  go: "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var nil true false",
  python: "and as assert async await break class continue def del elif else except finally for from global if import in is lambda None nonlocal not or pass raise return try while with yield True False",
  sql: "select from where and or not in is null as join left right inner outer on group by order having limit offset distinct with over partition case when then else end union all desc asc between like insert into values update set delete create table",
  bash: "",
  yaml: "true false null",
  json: "true false null",
};

const COMMENT = {
  go: "\\/\\/.*|\\/\\*[\\s\\S]*?\\*\\/",
  python: "#.*",
  sql: "--.*",
  bash: "(?<=^|\\s)#.*",
  yaml: "(?<=^|\\s)#.*",
  json: "(?!)",
};

// Строка идёт в шаблоне раньше комментария: символ комментария внутри строки
// («http://…», "a # b") остаётся частью строки.
const STRING = "\"\"\"[\\s\\S]*?\"\"\"|'''[\\s\\S]*?'''|\"(?:\\\\.|[^\"\\\\\\n])*\"|'(?:\\\\.|[^'\\\\\\n])*'|`[^`]*`";

const cache = new Map();

function grammar(language) {
  if (!cache.has(language)) {
    const words = new Set(KEYWORDS[language].split(" ").filter(Boolean));
    cache.set(language, {
      words,
      pattern: new RegExp(`(${STRING})|(${COMMENT[language]})|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_][A-Za-z0-9_]*)`, "gm"),
    });
  }
  return cache.get(language);
}

/** @returns {{ text: string, kind?: "string" | "comment" | "number" | "keyword" }[]} */
export function highlight(code, language) {
  const lang = language === "golang" ? "go" : language === "sh" || language === "shell" ? "bash" : language === "yml" ? "yaml" : language;
  if (!code || !(lang in KEYWORDS)) return [{ text: code || "" }];
  const { words, pattern } = grammar(lang);
  const tokens = [];
  let last = 0;
  pattern.lastIndex = 0;
  for (let match = pattern.exec(code); match; match = pattern.exec(code)) {
    const [text, string, comment, number, word] = match;
    let kind;
    if (string !== undefined) kind = "string";
    else if (comment !== undefined) kind = "comment";
    else if (number !== undefined) kind = "number";
    else if (word !== undefined && words.has(lang === "sql" ? word.toLowerCase() : word)) kind = "keyword";
    if (!kind) continue;
    if (match.index > last) tokens.push({ text: code.slice(last, match.index) });
    tokens.push({ text, kind });
    last = match.index + text.length;
  }
  if (last < code.length) tokens.push({ text: code.slice(last) });
  return tokens;
}
