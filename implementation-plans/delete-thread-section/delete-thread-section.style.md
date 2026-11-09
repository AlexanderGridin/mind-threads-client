# Coding style: Delete a section from a thread

## From the project
- Arrow-function components and hooks, named exports only — `src/pages/DashboardPage/components/DeleteThreadModalContainer/`, `src/services/useThreadsService/`
- `type` for all contracts; no `interface` declarations found — `src/services/`, `src/components/`
- Component folder per component, with `index.ts` barrel, `.constants.ts`, `.utils.ts`, `.types.ts`, `.hooks.ts` files named after the component — `src/pages/ThreadPage/components/ThreadPageLoader/`, `src/pages/DashboardPage/components/DeleteThreadModalContainer/`
- Test IDs built with `initTestIdCreator("<ComponentName>__")` and exported as `<ComponentName>TestId` `as const` object — `src/components/shared/ThreadFormModalActions/ThreadFormModalActions.constants.ts`
- Component props types declared in the component file, not exported (18 component files) — `src/pages/ThreadPage/components/ThreadContent/components/ThreadColumns/components/SectionsColumn/components/SectionCard/SectionCard.tsx`. Only 6 files use `.types.ts` for props.
- Nested sub-components in a `components/` folder inside the parent component folder — `src/pages/DashboardPage/components/DeleteThreadModalContainer/components/DeleteThreadModal/components/`
- Ternary for conditional rendering, `return sectionToDelete ? (...) : null` — `DeleteThreadModalContainer.tsx`
- `handle[EventName]()` functions for event handlers in JSX — `CLAUDE.md`
- Context split into value and action contexts, with inline object values and no `useMemo` (React Compiler is enabled) — `src/pages/ThreadPage/components/ThreadPageLoader/ThreadPageLoader.tsx`, `CLAUDE.md`
- Prettier: 2-space indent, double quotes, 80 columns, trailing commas `es5`, always-parenthesized arrow params — `.prettierrc.json`
- Tests: `renderWithUIProvider` from `@/components/lib/__test-fixtures__`, `setup()` functions, `userEvent.setup()` inside `setup()` — `CLAUDE.md`

## From the code guides
- Single-line `if` with braces on their own line, no `if (x) doIt();` — `typescript.md` rule 8
- Block bodies with explicit `return` in arrow functions — `typescript.md` rule 9
- Empty line above every multiline statement — `typescript.md` rule 10
- Truthiness checks, no `=== null` or `!== null` unless a strict check is needed — `typescript.md` rule 11
- Do not repeat yourself; extract shared functions — `typescript.md` rule 4
- Split long functions by logical responsibility — `typescript.md` rule 5
- Meaningful names; no single-character names except `e` for errors/events — `typescript.md` rule 7
- Object destructuring parameter for functions with 2 or more parameters — `typescript.md` rule 3
- Function components only; props type stays in the component file unless used elsewhere — `react.md` rule 4
- One component per file; separate all-in-one components — `react.md` rule 7
- Test files in `__tests__/` next to the unit; root `describe()`; `setup()` / `setupHook()`; `vi.clearAllMocks()` before each test — `unit-tests.md` rules 2, 8, 9, 10
- Store elements in constants before assertions and user events — `unit-tests.md` rules 13, 18
- `toStrictEqual()` for reference types — `unit-tests.md` rule 11
- `.not.toBeInTheDocument()` on stored `queryBy*` results, not `toBeNull()` — `unit-tests.md` rule 19
- Shared test helpers in one file, mocks defined once — `unit-tests.md` rules 5, 6

## Decided by the developer
- Props type of `DeleteConfirmationModalActions` → declared in `DeleteConfirmationModalActions.tsx`, not exported; no `DeleteConfirmationModalActions.types.ts` file. Overrides the Step 6 file list. (Developer decision, Phase 1 start.)
- Component props types stay in the component file and are not exported unless a test or another file needs them (from the plan's Style notes; `react.md` rule 4; `SectionCard.tsx`)
- Existing single-line `if` and `=== null` checks in the project are not copied; new code follows `typescript.md` rules 8, 9, and 11; existing code is not rewritten unless a step changes it (from the plan's Style notes)
- Context values are inline objects split into value and action contexts, with no `useMemo` (from the plan's Style notes)
- Sections are deleted by `id`, never by name (from the plan's Style notes)
- `useThreadsService` calls `useThreadSectionsService` by relative path; the sections service never calls the threads service (from the plan's Style notes)
- Test IDs are imported by file path, not through the `index.ts` barrel (from the plan's Style notes)
- Formatting: 2 spaces, double quotes, 80 columns (from the plan's Style notes; `.prettierrc.json`)
