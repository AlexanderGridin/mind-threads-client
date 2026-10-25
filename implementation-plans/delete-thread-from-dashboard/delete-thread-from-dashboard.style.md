# Coding style: Delete a thread from the dashboard

## From the project
- Named exports only, with a barrel `index.ts` in each folder; `src/components/lib/index.ts` re-exports every adapter — `src/components/lib/index.ts`
- Components are PascalCase arrow functions with destructured props — `src/components/lib/Dialog/Dialog.tsx`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.tsx`
- Files split by concern with dotted suffixes (`.constants.ts`, `.utils.ts`, `.hooks.ts`, `.types.ts`, `.context.ts`) — `src/pages/DashboardPage/components/DashboardPageLoader/`
- Sub-components sit in a `components/` folder: simple ones as flat `.tsx` files (`CardColorIndicator.tsx`), larger ones as a folder with `index.ts` (`AddNewThreadModalActions/`) — `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/components/`, `.../AddNewThreadModalContainer/components/`
- Test IDs use `initTestIdCreator("<Name>__")` and a `<Name>TestId` `as const` object — `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/MindThreadCard.constants.ts`
- User-visible strings are `UPPER_SNAKE_CASE` constants in `*.constants.ts`; strings that embed a thread title are `get...Message` functions in `*.utils.ts` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.utils.ts`
- Modal state lives in `DashboardPageLoader`; values and actions are split into two contexts; a `*Container` reads them and renders the modal conditionally with `: null` — `src/pages/DashboardPage/components/DashboardPageLoader/DashboardPageLoader.tsx`, `.../AddNewThreadModalContainer/`
- Chakra components are used only inside `src/components/lib/` adapters; features import from `@/components/lib` — `CLAUDE.md`
- The destructive colour uses the Nord red semantic token via `background="red"` on `Button` and `color="red"` on menu items; do not use `colorPalette="red"` (it resolves to Chakra's default red, not Nord) — `src/components/lib/theme/theme.ts`, `AddNewThreadModalActions.tsx` uses `background="accent"`
- Handlers inside components are named `handle<Event>`; conditional rendering uses a ternary with `: null`; no `useMemo`/`useCallback` (React Compiler) — `CLAUDE.md`
- Adapters that need a DOM ref use `forwardRef` with a `displayName` — `src/components/lib/IconButton/IconButton.tsx`
- Props types are exported from the component file, as the existing adapters do — `src/components/lib/Dialog/Dialog.tsx`. Overridden for new files, see Decided by the developer.
- Formatting: Prettier, `printWidth` 80, 2-space indent, semicolons, double quotes, `es5` trailing commas — `.prettierrc.json`
- Tests: co-located `__tests__/` folder with a root `describe`, a `setup()` that creates `userEvent.setup()` and renders with `renderWithUIProvider` — `CLAUDE.md`, `src/pages/DashboardPage/components/DashboardContent/components/MindThreadCard/__tests__/`

## From the code guides
- `type` over `interface` — `typescript.md` (rule 1)
- Arrow functions instead of function declarations — `typescript.md` (rule 2)
- A function with two or more parameters takes one destructured object parameter — `typescript.md` (rule 3)
- Do not repeat yourself; share functions used in more than one place — `typescript.md` (rule 4)
- Split long functions by logical responsibility — `typescript.md` (rule 5)
- Named exports/imports only, no default exports — `typescript.md` (rule 6)
- Meaningful names; no single-character names except conventions such as `e` for events — `typescript.md` (rule 7)
- Type-only imports use `import type` — `CLAUDE.md`, required by `verbatimModuleSyntax`
- Component files use PascalCase; function components only; arrow functions — `react.md` (rules 1–3)
- No all-in-one components; extract separate elements into their own components — `react.md` (rule 7)
- Context values split into state and action values — `react.md` (rule 8)
- Test helpers: `setup()` first, user event set up inside `setup()` before rendering, small helpers for repeated logic, no duplicated mocks, `waitFor()`/`act()` only when nothing else works — `unit-tests.md` (rules 2–4, 6, 7)
- Mocks only when there is no other way to test the behaviour; utilities and child components are tested as they are — `unit-tests.md` (rule 1)
- Clear all mocks before each test; root `describe()` per test file; tests in `__tests__/` scoped to the unit — `unit-tests.md` (rules 8–10)
- `toStrictEqual()` for objects and arrays; `toEqual()` only for primitives — `unit-tests.md` (rule 11)
- To wait for removal: keep the element in a variable, then `await waitForElementToBeRemoved(element)` — `unit-tests.md` (rule 12)
- Store an element in a constant before asserting on it — `unit-tests.md` (rule 13)

## Decided by the developer
- Where exported props types go → Follow the guide: a props type that is exported is moved to `<ComponentName>.types.ts` (`react.md` rule 5). New files that export a props type get their own `.types.ts` file. Non-exported props types stay inside the component file (`react.md` rule 4). Existing adapters (`Button`, `Dialog`) keep their current location because they are outside this feature's new files. Plan impact: the file lists for Step 7 (`Menu`), Step 8 (`DeleteThreadModalActions`) and Step 9 (`DeleteThreadModal`) each gain a `*.types.ts` file, which is added to that step when it is reached.
