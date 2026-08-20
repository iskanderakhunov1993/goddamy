import assert from "node:assert/strict";
import test from "node:test";
import { qaChallenges, getQaChallenge } from "../src/content/qaChallenges.js";

test("qa trainer has a unique, well-formed challenge per id", () => {
  assert.equal(new Set(qaChallenges.map((item) => item.id)).size, qaChallenges.length);
  for (const challenge of qaChallenges) {
    assert.ok(challenge.title);
    assert.ok(challenge.category);
    assert.ok(challenge.scenario);
    assert.ok(challenge.explanation);
    assert.ok(["Лёгкая", "Средняя", "Сложная"].includes(challenge.level));
  }
});

test("choice challenges reference a valid correct option", () => {
  for (const challenge of qaChallenges.filter((item) => item.type === "choice")) {
    assert.ok(Array.isArray(challenge.options) && challenge.options.length >= 2);
    assert.ok(challenge.correct >= 0 && challenge.correct < challenge.options.length);
  }
});

test("checklist challenges have a non-empty correct subset of their options", () => {
  for (const challenge of qaChallenges.filter((item) => item.type === "checklist")) {
    assert.ok(Array.isArray(challenge.options) && challenge.options.length >= 3);
    assert.ok(Array.isArray(challenge.correct) && challenge.correct.length > 0);
    for (const answer of challenge.correct) assert.ok(challenge.options.includes(answer));
  }
});

test("bug-report challenges define fields, severities and a complete model answer", () => {
  for (const challenge of qaChallenges.filter((item) => item.type === "bug-report")) {
    assert.ok(challenge.fields.length >= 3);
    for (const field of challenge.fields) {
      assert.ok(field.id);
      assert.ok(field.label);
      assert.ok(challenge.model[field.id]);
    }
    assert.ok(challenge.severities.includes(challenge.model.severity));
  }
});

test("getQaChallenge falls back to the first challenge for an unknown id", () => {
  assert.equal(getQaChallenge("does-not-exist"), qaChallenges[0]);
});
