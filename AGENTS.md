# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Durable design decisions

- Use the selected editorial learning layout from concept 2.
- Keep the product in a light theme for now: warm near-white background, white reading surfaces, dark typography, blue informational accents, and lime progress/primary actions.
- The product name is **Godemy**.
- Persist user progress and product data in the application's server-side database. Do not treat `localStorage` as the source of truth; it may only be used later as a non-authoritative cache.
- Frame the course as a full work simulation at fictional company **Bit Tech**, a subsidiary of a fictional leading crypto bank.
- The recurring cast includes the learner plus interns Danil and Linar; kind Go team lead Roma; strict pride head Roman Arkadievich; commanding product manager Yulia; knowledgeable friendly QA Igor; DevOps engineer Zhenya; HR Olya; and product owner Iskander.
- Use the approved minimal character style from `public/characters/bit-tech-team-minimal-blue-v1.png`: mostly white skin fills, black hair, thin charcoal contours, simplified adult faces, a single cobalt-blue clothing accent, almost no shading, and generous white space. Keep each character recognizable through silhouette, pose, clothing, and prop across avatars, emotions, and scenes.
- Character anchors: Linar is a bald male intern; Danil wears a cobalt baseball cap; Yulia is strict and commanding, with a fitted cobalt top and high-waisted black trousers.
- Character anchors: Roma is tall and stocky, wears cobalt over-ear headphones and an open plaid overshirt over a white T-shirt, has a very short haircut and a neutral attentive expression; Roman Arkadievich is a compact, fictional Silicon Valley executive archetype in a charcoal T-shirt and dark jeans, with a cold high-status gaze (do not portray a real person's likeness); Igor is a large, warm, patient QA engineer associated with a test checklist.
- Character anchors: Zhenya is a composed DevOps engineer with rectangular glasses, a cobalt hoodie, and a laptop; Olya is a warm professional HR manager with a black hair bun, cobalt blazer, and folder; Iskander is a thoughtful product owner in a cobalt T-shirt with a small roadmap tablet.
- The `/go` screen is a personal course cabinet: a compact left rail, a course progress card, a calm weekly-goal prompt, and a three-column programme grid.
- The `/lesson` screen follows an editorial narrative: compact rail, topic progress, chat-style team dialogue, an inline micro-task, and one clear next-step button.
- Use the supplied learning-platform references for structure and interaction patterns, while retaining Godemy, Bit Tech, the cobalt accent, and original characters rather than copying third-party branding.
- Keep the course hierarchy fixed at six modules; each module contains five topics, and each topic contains five to six lessons. Module cards open their topic list, and topic rows open their lesson list.
- Keep `/course-editor` deliberately simple: a module/topic/lesson tree on the left and one focused editing form on the right. Drafts may use localStorage only as a temporary cache until the server-side database API is connected.
- Lesson authoring uses reorderable blocks: headings, formatted text, images, quotes, lists, dialogue, links, Go code, callouts, quizzes, practical tasks, and dividers. Preserve a single-column editorial learner preview.
- The product curriculum is an original six-module Go Backend Internship: onboarding and tools; Go foundations; Task Tracker CLI; Expense Tracker with PostgreSQL; URL Shortener API with Docker and CI; release, portfolio, and final review. It contains 30 topics and 150 lessons.
- The work-simulation loop is: receive a Bit Tech brief, decompose it, learn just-enough theory, implement independently, verify with commands/checklists, then document the GitHub artifact and retrospect. Use soft weekly rhythm, evidence-based achievements, and a certificate only after all three projects are verified; never promise employment.
- The public landing follows an academy pattern adapted from product research: one clear Go outcome, three above-the-fold routes (course, trainer, internship), then audience, programme, practice, and evidence-based outcome. Keep it original, light, and free-first; do not use competitor branding, copied copy, or dark visual styling.
- `/trainer` is the Go practice catalogue. It must support search plus filtering by difficulty and topic, show task duration, and open a dedicated `/task/:challengeId` practice surface.
- SQL is the second available Godemy direction. Keep its course at `/sql`, its course-specific practice at `/sql/practice`, and individual SQL exercises at `/sql/practice/:challengeId`; do not place SQL practice in global navigation.
- Python is the third available Godemy direction. Keep its course at `/python`, its course-specific practice at `/python/practice`, and exercises at `/python/practice/:challengeId`; retain the shared light Godemy design and keep practice course-scoped.
- Keep the public product architecture two-level: `/` is the universal Godemy IT-learning landing, while `/academy` is the compact hub for the currently available Go course and trainer. Position Godemy as practice-first learning with short essential theory, projects, verified certificates, and access through one subscription. Public CTAs lead to `/academy` before entering the learning surfaces.
- Practice belongs to a specific course rather than the universal platform navigation. Use `/go/practice` and `/go/practice/:challengeId` for Go exercises; every future course should expose its own practice area from inside its course hub.
