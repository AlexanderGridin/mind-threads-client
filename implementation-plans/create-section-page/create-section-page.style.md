# Coding style: Create a page in a thread section

## From the project
- Formatting: 2 spaces, double quotes, semicolons, 80 columns, `es5` trailing commas, `arrowParens: always` — `.prettierrc.json`
- Component folders hold `<Name>.tsx`, `<Name>.constants.ts`, `<Name>.types.ts`, `<Name>.utils.ts`, `<Name>.hooks.ts` and `index.ts`; sub-components go in a `components/` subfolder with its own `index.ts` barrel — `src/pages/ThreadPage/components/`
- Services use the folder layout `useXService.ts`, `.types.ts`, `.constants.ts`, `.utils.ts`, `index.ts`; storage uses `useLocalStorage({ key, throwOnError: true })` with a private `getX()` that returns `[]` for no data and throws an `INVALID_..._DATA_ERROR` constant for bad data — `src/services/useThreadSectionsService/`
- Service methods read the stored list, filter or build, then `set` once; `build…` helpers trim names and set `id` and `createdAt` — `useThreadSectionsService.utils.ts`
- Test IDs are created with `initTestIdCreator("Prefix__")` in `<Name>.constants.ts` and exported as a `<Name>TestId` object — `SectionCard.constants.ts`
- Component props types are declared in the component file and not exported — `SectionCard.tsx`
- Hooks for a page live in `ThreadPageLoader.hooks.ts`; context hooks are `useThreadPageValue` / `useThreadPageAction` — `ThreadPageLoader.hooks.ts`
- Context values are inline objects split into value and action contexts; no `useMemo` or `useCallback` (React Compiler) — `CLAUDE.md`
- Conditional rendering uses ternaries, never `&&` — `CLAUDE.md`
- Event handlers are internal `handle[EventName]` functions — `CLAUDE.md`
- Component functions are arrow functions; no `interface`, no function declarations — `src/` (none found)
- Named exports only; barrels use `export * from "./File"` — `src/services/index.ts`, `src/components/shared/index.ts`
- Path alias `@/` for `src/`; `import type` for type-only imports — `tsconfig.app.json`, `CLAUDE.md`
- Tests: a `setup()` helper per test file, `userEvent.setup()`, `renderWithUIProvider` from `@/components/lib/__test-fixtures__`, `renderWithRouter` from `@/__test-fixtures__` for routed components — `CLAUDE.md`, `ThreadFormModalActions.test.tsx`
- Test fixtures live in `src/__test-fixtures__/<area>/` with `<area>.ts`, `<area>.storage.ts`, `<area>.queries.ts`, `<area>.interactions.ts` — `src/__test-fixtures__/sections/`

## From the code guides
- `type` over `interface` — `typescript.md` rule 1
- Arrow functions for functions and components — `typescript.md` rule 2, `react.md` rule 3
- Object destructuring for functions with 2 or more parameters — `typescript.md` rule 3
- Do not repeat yourself; shared logic goes into one function or hook (`useCreateModal` for the add-section and add-page modals) — `typescript.md` rule 4
- Split long functions by logical separation — `typescript.md` rule 5
- Named imports and exports only — `typescript.md` rule 6
- Meaningful names; no single-character names except the conventional `e` — `typescript.md` rule 7
- No single-line `if`; always use braces on their own lines — `typescript.md` rule 8
- Arrow functions with a block body and an explicit `return` — `typescript.md` rule 9
- Empty line above every multiline statement, unless it is the first in its block — `typescript.md` rule 10
- Rely on truthiness instead of `=== null`, `!== null`, or `=== ""` — `typescript.md` rule 11
- Do not create all-in-one components; split elements into separate components — `react.md` rule 7
- Component-specific utils and hooks use the file-based approach (`.utils.ts`, `.hooks.ts`) while they stay small — `react.md` rule 6
- Do not add features, refactor, or touch code outside the step's scope — `michelangelo` scope rules

## Decided by the developer
- New hooks go into the existing `ThreadPageLoader.hooks.ts`; no `hooks/` folder → kept as one file (from the plan's Style notes, `create-section-page.feature.md`)
- Pages are stored under their own `pages` key by a new `useSectionPagesService`; `useThreadsService` imports it by relative path, and the pages and sections services never call each other or the threads service → as in the plan's Style notes (from `create-thread-section.feature.md`)
- The page entity is named `SectionPage` in code → as in the plan's Style notes (architect decision)
- Context values are inline objects split into value and action contexts, with no `useMemo` → overrides `react.md` rule 8 (from the plan's Style notes, from `create-thread-section.feature.md`)
- Single-line `if`s, implicit-return one-liners, and `=== null` checks that exist in the project are not copied; new code follows `typescript.md` rules 8, 9, 11; existing code is not rewritten unless a step changes it → overrides project code (from the plan's Style notes, from `create-thread-section.feature.md`)
- Component props types stay in the component file and are not exported unless a test or another file needs them → overrides `react.md` rule 4–5 (from the plan's Style notes; matches `SectionCard.tsx`)
- Test IDs are imported by file path, because the `index.ts` of a component exports only the component → (from the plan's Style notes; matches `ThreadFormModalActions`)
- Conditional rendering uses ternaries, never `&&` → (from the plan's Style notes, `CLAUDE.md`)
- Formatting is 2 spaces, double quotes, 80 columns → (from the plan's Style notes, `.prettierrc.json`)
