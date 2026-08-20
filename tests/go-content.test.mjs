import assert from "node:assert/strict";
import test from "node:test";
import { goChallenges, getGoChallenge } from "../src/content/goChallenges.js";

test("every go challenge has a unique id and required fields", () => {
  assert.equal(new Set(goChallenges.map((item) => item.id)).size, goChallenges.length);
  for (const challenge of goChallenges) {
    assert.ok(challenge.title);
    assert.ok(challenge.category);
    assert.ok(challenge.description);
    assert.ok(challenge.hint);
    assert.ok(["Лёгкая", "Средняя", "Сложная"].includes(challenge.level));
  }
});

test("starter and reference solution declare the same package and function signature", () => {
  for (const challenge of goChallenges) {
    assert.match(challenge.starter, /^package main/);
    assert.match(challenge.referenceSolution, /^package main/);
    const signatureMatch = challenge.starter.match(/func \w+\([^)]*\)[^{]*\{/);
    assert.ok(signatureMatch, `${challenge.id} starter should declare a function`);
    assert.ok(challenge.referenceSolution.includes(signatureMatch[0]), `${challenge.id} reference solution should keep the same signature as the starter`);
  }
});

test("harness only defines main() and does not redeclare package or imports", () => {
  for (const challenge of goChallenges) {
    assert.match(challenge.harness.trim(), /^func main\(\) \{/);
    assert.doesNotMatch(challenge.harness, /^package /m);
  }
});

test("getGoChallenge falls back to the first challenge for an unknown id", () => {
  assert.equal(getGoChallenge("does-not-exist"), goChallenges[0]);
});
