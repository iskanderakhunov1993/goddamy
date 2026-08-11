# Design QA — universal Godemy landing

## Reference and implementation

- Source of truth: `/Users/iskander/.codex/generated_images/019faa85-3626-7963-9506-fb9dd93c22c6/exec-c2bbf0ae-43cf-4593-9c28-73f78e5d88f3.png`
- Desktop implementation: `/Users/iskander/Documents/go acafemy/implementation-home-desktop-final2.png`
- Mobile implementation: `/Users/iskander/Documents/go acafemy/implementation-home-mobile.png`
- Side-by-side comparison: `/Users/iskander/Documents/go acafemy/design-qa-comparison-final2.png`

## Tested states

- Desktop landing at CSS viewport width 1440 px.
- Mobile landing at CSS viewport width 389 px.
- Default landing state with universal hero and course catalogue.
- Primary CTA opens `/academy`.
- Secondary CTA opens `/#courses` and scrolls to the course section.
- No horizontal overflow at the tested desktop and mobile widths.
- No browser console errors during the checked path.

## Visual review

- Typography: the large editorial headline, compact navigation and supporting copy follow the selected concept.
- Layout: the split hero, rounded lavender surface, course rows and generous white space match the selected structure.
- Colour: warm near-white page, cobalt illustration, dark typography and lime primary actions are preserved.
- Imagery: the custom team illustration is used as a real image asset and remains legible without carrying essential information alone.
- Content: the removed “Первый рабочий день” framing was replaced with the universal promise “Осваивайте IT через реальные задачи”.
- Responsiveness: desktop composition collapses into a readable single-column mobile flow with full-width touch targets.

## Iteration notes

- Initial comparison: hero height was too short and the team illustration felt undersized.
- Fix: increased desktop hero height and adjusted image scale and positioning to restore the selected visual balance.
- Final result: passed.

## SQL course extension

- Reference reviewed: `https://sql-academy.org/ru` for course/trainer information architecture only; Godemy copy, curriculum, data and visual treatment are original.
- Verified `/sql` at 1910 px: course hero, outcome card, learning loop and expandable six-module programme render without horizontal overflow.
- Verified `/sql/practice`: search/filter surface exposes nine realistic starter tasks and keeps practice inside the SQL course context.
- Verified `/sql/practice/monthly-turnover`: editor accepts a query, the run action works, and a successful result table is rendered.
- Global landing now presents SQL as an available direction; global navigation still avoids a generic practice destination.
- Final result: passed.

## Python course extension

- Reference reviewed: `https://python-academy.org/ru` for information architecture, curriculum breadth and course-to-trainer flow; all Godemy copy, exercises, mock data and interface styling are original.
- Verified `/python`: six-module programme, outcome card, learning loop and final project render without horizontal overflow at the available desktop viewport.
- Verified `/python/practice`: nine tasks, course-scoped navigation, search and topic/difficulty controls render correctly.
- Verified `/python/practice/clean-name`: the editor accepts code, “Запустить тесты” works, and successful automated checks appear in the result panel.
- The universal catalogue exposes Python as available while practice remains inside the Python course rather than global navigation.
- Final result: passed.

## Unified course cabinet

- Selected reference: `/var/folders/sg/szq02d257p75jlbsg24kswnw0000gn/T/TemporaryItems/NSIRD_screencaptureui_m9Ezp4/Снимок экрана 2026-08-11 в 23.09.19.png`.
- Latest implementation capture: `/Users/iskander/Documents/go acafemy/course-cabinet-python-final.png`.
- Compared at the available desktop viewport: compact left rail, white progress card, vertically stacked course actions, study-rhythm prompt, role note and three-column six-module grid match the selected reference structure and density.
- Go, SQL and Python each render six cards with their own content and course-specific practice button; no horizontal overflow was found.
- From the universal landing, the Go card now opens `/go` directly. SQL and Python already open `/sql` and `/python` directly; the hero and subscription CTA also avoid the intermediate `/academy` page.
- Opening a module produces a working topic dialog with five topic rows and a clear close action.
- Final result: passed.
