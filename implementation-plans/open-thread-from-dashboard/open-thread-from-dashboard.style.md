# Coding style: Open a thread from the dashboard

## From the project
- Files and folders: each component in its own folder with `<Name>.tsx`, `<Name>.constants.ts`, `<Name>.types.ts`, `index.ts`, plus `components/` and `__tests__/` subfolders — `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/`
- Hooks and page state split into flat `<Feature>.hooks.ts`, `<Feature>.types.ts`, `<Feature>.constants.ts`, `<Feature>.utils.ts` files — `src/pages/DashboardPage/components/DashboardPageLoader/`
- Shared components: one folder per component with an `index.ts`, re-exported from `src/components/shared/index.ts` and imported via `@/components/shared` — `src/components/shared/`
- Shared hooks: one folder per hook with `<hookName>.ts` and `index.ts`, re-exported from `src/hooks/index.ts` — `src/hooks/useFetch/`
- Shared utils: flat files in `src/utils/` with a barrel `index.ts` — `src/utils/index.ts`
- Lib adapters: one folder per adapter with `<Name>.tsx` and `index.ts`, exported from `src/components/lib/index.ts`; exported `*Props` types stay in the adapter file — `src/components/lib/Text/Text.tsx`, `src/components/lib/Box/Box.tsx`
- Barrel exports at each level: `index.ts` per folder, parent `index.ts` re-exports — `src/components/lib/`, `src/pages/DashboardPage/components/`
- Named exports only, no default exports — whole `src/`
- `type` for all contracts; no `interface` anywhere in `src/` — whole `src/`
- Components are arrow functions with destructured props in the parameter list — `src/components/lib/Text/Text.tsx`, `DeleteThreadModal.tsx`
- Test IDs: `initTestIdCreator("<Name>__")` plus a `<Name>TestId` `as const` object — `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`; titles built from a thread title are `get...` functions in `*.utils.ts` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts`
- Conditional rendering uses a ternary, not `&&` — `CLAUDE.md`
- Event handlers inside components are named `handle<Event>`; navigation/action hooks are named `use<Action>` — `CardActions.tsx`, `CLAUDE.md`
- No `useMemo`/`useCallback`: the React Compiler memoizes — `CLAUDE.md`
- Page state load effect: runs only while the status is `Loading`, uses an `isActive` flag, and sets state only after the service resolves; the status guard prevents a reload loop — `useThreadsState` in `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.hooks.ts`
- Services are called with `useThreadsService()`; a service returns a promise and "not found" resolves `null` — `src/services/useThreadsService/`
- Path aliases `@/` for imports from `src/` — `CLAUDE.md`
- Routes are defined in `src/routing/AppRoutes.tsx`, with the route constants in `src/routing/` — `src/routing/AppRoutes.tsx`
- Tests: root `describe`, a `setup()` that calls `userEvent.setup()` and `renderWithUIProvider` — `src/pages/DashboardPage/components/DeleteThreadModalContainer/` tests
- Shared test helpers and fixtures live in `src/__test-fixtures__/` — `index.ts`, `threads.ts`, `deferred.ts`

## From the code guides
- Functions with two or more parameters take one destructured object — `typescript.md` rule 3 (also in the plan's Style notes)
- Do not repeat logic; one shared util where a function is used in more than one place — `typescript.md` rule 4 (also in the plan's Style notes)
- Use meaningful names; no single-character names — `typescript.md` rule 7
- Use `import type` for type-only imports — `typescript.md`, `CLAUDE.md` (`verbatimModuleSyntax`)
- Add a blank line above every multiline statement, unless it is the first in its block — `typescript.md` rule 10
- Split long functions by logical concern — `typescript.md` rule 5
- Components: one component per file; no all-in-one components; separate elements become separate components — `react.md` rule 7
- Props type of a component that is not exported stays in the component file — `react.md` rule 4
- Tests: `setup()` is the first function in each test file; user events are set up inside `setup()` before rendering — `unit-tests.md` rules 2–3
- Tests: use `toStrictEqual()` for objects and arrays — `unit-tests.md` rule 11
- Tests: store elements in a variable before asserting on them — `unit-tests.md` rule 13
- Tests: clear all mocks before each test (`vi.clearAllMocks()`) — `unit-tests.md` rule 8
- Tests: shared helpers used by more than one test file go in one shared file (`renderWithRouter` in `src/__test-fixtures__/`) — `unit-tests.md` rule 5
- Tests: `waitFor()` and `act()` only where nothing else works — `unit-tests.md` rule 7

## Decided by the developer
- Components that are shared between features live in `src/components/shared/`, each in its own folder with an `index.ts`, imported via `@/components/shared` → as in the plan's Style notes (`AppLogo` moves there)
- Move files with `git mv` to keep history → as in the plan's Style notes
- An exported props type of a component in `src/components/shared/` and in feature folders goes to `<ComponentName>.types.ts`; a props type that is not exported stays in the component file → as in the plan's Style notes
- An exported props type of a lib adapter (`src/components/lib/`) stays in the adapter file, like `Text.tsx` and `Box.tsx`; this applies to the new `LinkOverlay` and `FullScreenLoader` adapters → developer decision (overrides the plan's Style notes line 84 for lib adapters only)
- Route paths live in `src/routing/routing.constants.ts` and `src/routing/routing.utils.ts`, imported by file path and not re-exported from `src/routing/index.ts` → as in the plan's Style notes (avoids the import cycle through `AppRoutes`)
- Stretched link: the card title is wrapped in `LinkOverlay asChild` with react-router's `Link` → as in the plan's Style notes
- Lib adapters stay router-agnostic; the caller passes the react-router `Link` as its child → as in the plan's Style notes
- Thread page state in a `useThreadState` hook in `ThreadPage.hooks.ts`, passed down as props; no context provider → as in the plan's Style notes
- Load effect follows `useThreadsState` (status guard, `isActive` flag, state after the service resolves) → as in the plan's Style notes
- Tab title by the shared `useDocumentTitle` hook; `index.html` is not changed → as in the plan's Style notes
- Header text and icons follow the thread color via `LightMode` / `DarkMode`, chosen by a WCAG contrast check → as in the plan's Style notes
- `APP_NAME` constant in `AppLogo.constants.ts`, used by the logo and the tab titles → as in the plan's Style notes
- Adapter props are added only as needed, and the adapters keep their explicit prop lists → as in the plan's Style notes
- User-visible strings in `UPPER_SNAKE_CASE` constants; thread-title titles in `get...` utils → as in the plan's Style notes
- Test IDs with `initTestIdCreator("<Name>__")` → as in the plan's Style notes
- Single-line `if` → braces on their own line (the project's single-line ifs in `DashboardPageLoader.hooks.ts` are not copied) → as in the plan's Style notes, `typescript.md` rule 8
- Arrow functions → block body with explicit `return` (the project's implicit one-liners are not copied) → as in the plan's Style notes, `typescript.md` rule 9
- `handle<Event>` for handlers; no `useMemo`/`useCallback` → as in the plan's Style notes (project and React Compiler win over `react.md` rule 8, which concerns contexts only and does not apply here)
- `FullScreenLoader` takes a required `shown: boolean` prop and renders nothing when it is `false`, so callers do not wrap it in a ternary → developer decision, changed during Phase 1 after Step 21 (the plan's Step 4 and Step 21 snippets are superseded; `ThreadPage.tsx` passes `shown={threadStatus === ThreadStatus.Loading}`)
- Thread page header order: app logo on the left, back button and thread title in the middle, color mode toggle on the right → developer decision during Phase 1 after Step 21; supersedes plan AC12 (back arrow at far left), AC13 (title right of the back arrow) and AC14 (logo centered); `ThreadHeader.tsx` is the component (the request named it `ThreadPageHeader`)
- Tests that render a thread card use one shared `renderWithRouter` helper from `src/__test-fixtures__/` → as in the plan's Style notes
- `if` checks on falsy values use truthiness: `if (someVar)` and `if (!someVar)`, not `!== null` / `=== null` (also for `""`, `undefined`, etc.); explicit comparisons only where a strict check is required (for example, `0` or `false` must not count as missing) → developer decision, added to `typescript.md` as rule 11 during Phase 1 Step 12; applies from Step 13 onward, and existing code is not rewritten
