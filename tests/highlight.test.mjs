import assert from "node:assert/strict";
import test from "node:test";
import { highlight } from "../src/lib/highlight.js";
import { lessonContent } from "../src/content/lessonContent/index.js";
import { pythonLessons } from "../src/content/python/lessons.js";
import { sqlLessons } from "../src/content/sql/lessons.js";

const kinds = (code, language) => highlight(code, language).filter((token) => token.kind).map((token) => `${token.kind}:${token.text}`);

test("highlight never changes the code text", () => {
  const blocks = [
    ...Object.values(lessonContent).flatMap((lesson) => lesson.blocks),
    ...pythonLessons.flatLessons.flatMap((lesson) => lesson.blocks),
    ...sqlLessons.flatLessons.flatMap((lesson) => lesson.blocks),
  ].filter((block) => block.type === "code");
  assert.ok(blocks.length > 50);
  for (const block of blocks) {
    assert.equal(highlight(block.code, block.language).map((token) => token.text).join(""), block.code);
  }
});

test("go: keywords, strings, numbers and comments", () => {
  assert.deepEqual(kinds('func main() { x := 42 // answer\n\treturn "ok" }', "go"), ["keyword:func", "number:42", "comment:// answer", "keyword:return", 'string:"ok"']);
});

test("a comment marker inside a string stays part of the string", () => {
  assert.deepEqual(kinds('url := "http://example.com" // real comment', "go"), ['string:"http://example.com"', "comment:// real comment"]);
  assert.deepEqual(kinds('print("a # b")  # note', "python"), ['string:"a # b"', "comment:# note"]);
  assert.deepEqual(kinds("SELECT '--x' -- note", "sql"), ["keyword:SELECT", "string:'--x'", "comment:-- note"]);
});

test("sql keywords are case-insensitive, identifiers are not keywords", () => {
  assert.deepEqual(kinds("select name from orders", "sql"), ["keyword:select", "keyword:from"]);
});

test("python triple-quoted strings and bash comments", () => {
  assert.deepEqual(kinds('x = """a\n# b"""', "python"), ['string:"""a\n# b"""']);
  assert.deepEqual(kinds("go build -o app . # сборка\necho $#", "bash"), ["comment:# сборка"]);
});

test("unknown language is returned untouched", () => {
  assert.deepEqual(highlight("## Заголовок", "markdown"), [{ text: "## Заголовок" }]);
});
