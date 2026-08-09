# Design QA — Godemy course skeleton

- source visual truth: `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_yHaUkT/Снимок экрана 2026-08-02 в 00.22.46.png` and `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_TMhUWU/Снимок экрана 2026-08-02 в 00.32.45.png`
- implementation screenshot: `/Users/iskander/Documents/go acafemy/design-qa-lesson.png`
- viewport: 798 × 818 CSS px, device scale factor 1; screenshot 798 × 796 px
- source dimensions: lesson reference 988 × 1564 px; outline reference 990 × 780 px
- density normalization: compared content regions rather than browser chrome; screenshots were viewed together in one comparison pass
- state: first lesson, light theme, initial checklist state; programme dialog also inspected live through all three levels

## Findings

No actionable P0, P1, or P2 differences remain for the requested structural adaptation.

- Fonts and typography: the implementation keeps a narrow editorial reading column, a strong lesson title, compact course context, and clear h2/body hierarchy. The Godemy system font is intentionally retained.
- Spacing and layout rhythm: the course uses the requested hierarchy `course → section → topic → lesson`; lesson content has measured text blocks, dialogue, example, self-check, and a final pager. The modal remains centered and scrollable.
- Colors and visual tokens: warm white background, dark typography, cobalt informational accents, green completion states, and restrained gray borders match the existing Godemy system.
- Image quality and asset fidelity: no images are rendered, by explicit product decision. No image placeholders, copied assets, or decorative approximations remain.
- Copy and content: all visible lesson material is original Godemy/Bit Tech copy. The reference contributes only information architecture and interaction rhythm.
- Responsive behavior: desktop and narrow mobile states were browser-tested. The initial 320 px global minimum caused horizontal overflow at a 260 px test viewport; it was removed. Final measured values are `innerWidth: 260`, `scrollWidth: 260`.
- Accessibility: navigation uses labelled buttons, the outline is a labelled modal dialog, checkboxes have visible labels, disabled/enabled states are exposed, and focus styles remain present.

## Focused region comparison

1. Programme dialog: source and implementation both progressively disclose course, topic, and lesson levels inside a centered white modal over a dimmed page.
2. Lesson reader: source and implementation both use a compact progress context, a focused reading column, clear section hierarchy, inline dialogue, self-check, and one dominant next action.

## Interaction evidence

- opened `/go`, then `Программа курса`;
- opened `Спринт 1 · Создание задач`, then `Старт Go и рабочая задача`;
- confirmed the resulting lesson list;
- opened `/go/lesson/intro/welcome/welcome` directly;
- checked all three self-check items and confirmed the completion button became enabled;
- completed the lesson and observed the success message;
- used `К следующему уроку` and confirmed navigation to `/go/lesson/intro/welcome/why-go`;
- checked browser console warnings and errors: none observed before screenshot persistence hit the local disk quota.

## Comparison history

- P2: narrow viewport overflowed because the global body minimum width was 320 px.
- Fix: removed the global minimum and added narrow-layout guards for the lesson shell, reader, and title wrapping.
- Post-fix browser evidence: `innerWidth: 260`, `documentElement.scrollWidth: 260`, `body.scrollWidth: 260`.

## Implementation checklist

- [x] Central course data model.
- [x] Six modules, thirty topics, and one hundred fifty lesson routes.
- [x] Three-level programme navigation.
- [x] Universal lesson template.
- [x] Previous/next navigation.
- [x] Self-check success state.
- [x] Direct-route recovery.
- [x] Desktop and narrow mobile checks.
- [x] Lint, production build, and Sites tests.

## Follow-up polish

- [P3] Persist completed lesson IDs in the server-side progress model when the database layer is connected.
- [P3] Add Escape-to-close and focus trapping to the programme modal.

final result: passed
