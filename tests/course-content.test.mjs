import assert from "node:assert/strict";
import test from "node:test";
import { course, setupTasks, sprints, stages } from "../src/content/goCourse.js";

test("course exposes one available project and four roadmap projects", () => {
  assert.equal(course.projects.length, 5);
  assert.equal(course.projects.filter((project) => project.status === "Доступен").length, 1);
  assert.equal(course.projects.filter((project) => project.status === "Скоро").length, 4);
});

test("project flow has setup, four unique sprints, and retrospective", () => {
  assert.equal(sprints.length, 4);
  assert.deepEqual(sprints.map((sprint) => sprint.number), [1, 2, 3, 4]);
  assert.equal(new Set(stages.map((stage) => stage.path)).size, stages.length);
  assert.equal(stages[0].path, "/go/task-tracker");
  assert.equal(stages.at(-1).path, "/go/task-tracker/retrospective");
});

test("every sprint contains the universal learning sections", () => {
  for (const sprint of sprints) {
    assert.ok(sprint.title);
    assert.ok(sprint.situation);
    assert.ok(sprint.goal);
    assert.ok(sprint.result);
    assert.ok(sprint.theory);
    assert.ok(sprint.example);
    assert.ok(sprint.tasks.length >= 5);
    assert.ok(sprint.criteria.length >= 4);
    assert.ok(sprint.hints.length >= 3);
    assert.ok(sprint.github.length >= 3);
  }
});

test("setup checklist contains twelve actionable steps", () => {
  assert.equal(setupTasks.length, 12);
  assert.equal(new Set(setupTasks.map((task) => task.id)).size, 12);
  for (const task of setupTasks) {
    assert.ok(task.title);
    assert.ok(task.explanation);
    assert.ok(task.verification);
    assert.ok(task.commonError);
  }
});
