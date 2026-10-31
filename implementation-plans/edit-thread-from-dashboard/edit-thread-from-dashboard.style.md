# Coding style: Edit a thread from the dashboard

## From the project
- Files and folders: each component in its own folder with `<Name>.tsx`, `<Name>.constants.ts`, `<Name>.types.ts`, `<Name>.utils.ts`, `index.ts`, plus `components/` and `__tests__/` subfolders — `src/pages/DashboardPage/components/DeleteThreadModalContainer/`
- Hooks and providers split into `<Feature>.hooks.ts`, `<Feature>.types.ts`, `<Feature>.constants.ts`, `<Feature>.utils.ts`, `<Feature>.context.ts` (flat files, not `utils/` or `hooks/` folders) — `src/pages/DashboardPage/components/DashboardPageLoader/`
- Services as a folder per service with `<name>.ts`, `.types.ts`, `.utils.ts`, `.constants.ts`, and `index.ts` — `src/services/useThreadsService/`
- Shared utils are flat files in `src/utils/` with a barrel `index.ts` — `src/utils/`
- Barrel exports at each level: `index.ts` per folder, parent `index.ts` re-exports — `src/components/lib/`, `src/pages/DashboardPage/components/`
- Named exports only, no default exports — whole `src/`
- `type` for all contracts; no `interface` anywhere in `src/` — whole `src/`
- Components are arrow functions with destructured props in the parameter list — `DeleteThreadModal.tsx`
- Props types of components are in `<Name>.types.ts` when exported, and kept in the component file otherwise — `DeleteThreadModal.types.ts`, `ThreadForm.tsx`
- Conditional rendering uses a ternary, not `&&` — `DeleteThreadModalContainer.tsx`, `CLAUDE.md`
- Event handlers inside components are named `handle<Event>` — `AddNewThreadModal.tsx`, `CardActions.tsx`
- No `useMemo`/`useCallback`: the React Compiler memoizes — `CLAUDE.md`
- Context values are split into a value context and an action context, consumed through `useDashboardPageValue` / `useDashboardPageAction` — `DashboardPageLoader.hooks.ts`
- Modal state lives in a `use<Action>...` hook; a `*Container` reads it and renders the modal with `? ... : null` — `DeleteThreadModalContainer.tsx`
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`; messages with a thread title are `get...Message` functions in `*.utils.ts` — `DashboardPageLoader.utils.ts`
- Test IDs: `initTestIdCreator("<Name>__")` plus a `<Name>TestId` `as const` object — `MindThreadCard.constants.ts`, `ThreadForm.constants.ts`
- Save button uses `background="accent"`; destructive/cancel uses `variant="outline"` for Cancel — `AddNewThreadModalActions.tsx`
- Service calls run first and React state updates only after they resolve — `useThreadsState` in `DashboardPageLoader.hooks.ts`
- Tests: root `describe`, a `setup()` that calls `userEvent.setup()` and `renderWithUIProvider` — `DeleteThreadModal.test.tsx`
- Shared test helpers and fixtures live in `src/__test-fixtures__/` — `index.ts`, `threads.ts`, `deferred.ts`

## From the code guides
- Functions with two or more parameters take one destructured object — `typescript.md` rule 3 (also in the plan's Style notes)
- Do not repeat logic; one shared util where a function is used in more than one place — `typescript.md` rule 4 (also in the plan's Style notes)
- Use meaningful names; no single-character names — `typescript.md` rule 7
- Use `import type` for type-only imports — `typescript.md`, `CLAUDE.md` (`verbatimModuleSyntax`)
- Add a blank line above every multiline statement, unless it is the first in its block — `typescript.md` rule 10
- Split long functions by logical concern — `typescript.md` rule 5
- Single-line `if` is not allowed: the body goes in braces on its own line — `typescript.md` rule 8 (decided by the developer, see below)
- Arrow functions use a block body with an explicit `return` — `typescript.md` rule 9 (decided by the developer, see below)
- Components: one component per file, no all-in-one components; split out separate elements — `react.md` rule 7
- Tests: `setup()` is the first function in each test file; user events are set up inside `setup()` before rendering — `unit-tests.md` rules 2–3
- Tests: use `toStrictEqual()` for objects and arrays — `unit-tests.md` rule 11
- Tests: store elements in a variable before asserting on them — `unit-tests.md` rule 13
- Tests: clear all mocks before each test (`vi.clearAllMocks()`) — `unit-tests.md` rule 8 (also in the plan's Style notes)
- Tests: mock a module once per file and wrap the real implementation; do not copy mocks — `unit-tests.md` rules 1, 6, 16
- Tests: shared helpers used by more than one test file go in one shared file — `unit-tests.md` rule 5
- Tests: `waitFor()` and `act()` only where nothing else works — `unit-tests.md` rule 7
- Tests: a deferred promise from `src/__test-fixtures__/` keeps an async call pending — `unit-tests.md` rule 15
- Tests: environment-specific options (e.g. pointer events check) are `setup` options with defaults — `unit-tests.md` rule 14

## Decided by the developer
- Components shared between the Add and Edit modals live in `src/components/shared/`, each in its own folder with an `index.ts`, re-exported from `src/components/shared/index.ts` and imported via `@/components/shared` → as in the plan's Style notes
- `AddNewThreadModalActions` becomes the shared `ThreadFormModalActions` (with `submitLabel` and `isSubmitting` props); no `EditThreadModalActions` → as in the plan's Style notes
- Move files with `git mv` to keep history → as in the plan's Style notes
- An exported props type goes to `<ComponentName>.types.ts`; a props type that is not exported stays in the component file → as in the plan's Style notes (overrides the project's inline `export type` in `AddNewThreadModal.tsx` and `ThreadForm.tsx`)
- Modal state, context wiring and `*ModalContainer` follow the delete-thread flow → as in the plan's Style notes
- Service first, then React state → as in the plan's Style notes
- User-visible strings in `UPPER_SNAKE_CASE` constants, thread-title messages in `get...Message` utils → as in the plan's Style notes
- `handle<Event>` for handlers; no `useMemo`/`useCallback` → as in the plan's Style notes (project and React Compiler win over `react.md` rule 8)
- Single-line `if` → braces (the project's single-line ifs in hooks and services are not copied; the plan's snippets already use braces)
- Arrow functions → block body with explicit `return` (the plan's implicit-return one-liners `replaceThread`, `applyThreadUpdate`, `getThreadUpdatedMessage`, `canSaveThreadChanges` are written with a block body when implemented; the project's implicit one-liners in `DashboardPageLoader.hooks.ts` are not copied)
